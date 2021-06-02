#!/usr/bin/env node

'use strict'
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const editJsonFile = require('edit-json-file')
const p = require('@commitlint/config-conventional')
const defaultConfig = require('./defaultConfig')
const arg = process.argv
const { prompt, MultiSelect } = require('enquirer')
let npmName = 'npm'

let formatType = (ruls = []) => {
    let types = {}
    ruls.forEach(item => {
        types[item.title] = item
    })
    return types
}
// 初始化commit ,将部分脚本写入到package.json中
if (arg[2] && arg[2] === 'init') {
  // if (true) {
  const packageFilePath = `${process.cwd()}/package.json`
  console.log(packageFilePath,'-packageFilePath')
    if (!fs.existsSync(packageFilePath)) {
        console.log(chalk.yellow('package.json 不存在'))
        process.exit(1)
    }

    let file = editJsonFile(packageFilePath)
    let hooks = {
        'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
    }
    let husky = file.get('husky') || {}
    husky.hooks = Object.assign(husky.hooks || {}, hooks)
    let types = formatType(defaultConfig)
    let commitlint = {
        extends: ['@commitlint/config-conventional'],
        rules: {
            'type-enum': [2, 'always', Object.keys(types)],
            'subject-case': [0],
        },
    }
    let config = file.get('config') || {}
    config.commitizen = Object.assign(config.commitizen || {}, {
        types,
    })
    file.set('config', config)
    file.set('commitlint', commitlint)
    const question = [
        {
            type: 'input',
            name: 'npmName',
            message: '请填写安装依赖使用工具, 默认为npm',
        },
        {
            type: 'Select',
            name: 'prettier',
            message: 'commit 前是否对提交代码进行 prettier 格式化',
            choices: ['yes', 'no'],
        },
        {
            type: 'Select',
            name: 'eslint',
            message: 'commit 前是否对提交代码进行 eslint 格式化',
            choices: ['yes', 'no'],
        },
        {
            type: 'Select',
            name: 'order',
            message: '是否使用changelog,运行命令自动生成commit日志',
            choices: ['yes', 'no'],
        },
    ]

    prompt(question)
        .then(async answer => {
            let isShowMultiSelect = false
            let choices = []
            let rules = {
                js: [],
                ts: [],
                css: [],
            }
            npmName = answer.npmName || npmName
            if (answer.prettier == 'yes') {
                isShowMultiSelect = true
                rules.js.push('prettier --write')
                rules.ts.push('prettier --write')
            }
            if (answer.eslint == 'yes') {
                isShowMultiSelect = true
                rules.js.push('eslint --fix')
                rules.ts.push('eslint --fix')
                rules.css.push('stylelint --fix')
            }
            choices = [
                {
                    name: 'js',
                    value: {
                        'src/**/*.{js,jsx,vue}': rules.js,
                    },
                },
                {
                    name: 'ts',
                    value: {
                        'src/**/*.{ts,tsx,vue}': rules.ts,
                    },
                },
                {
                    name: 'css',
                    value: {
                        'src/**/*.(vue|scss|css|sass|less)': rules.css,
                    },
                },
            ]
            let pro = new MultiSelect({
                type: 'MultiSelect',
                nmae: 'value',
                limit: 3,
                message: '请按空格选择格式化匹配规则（多选）？',
                choices: choices,
                result(names) {
                    return this.map(names)
                },
            })
            if (isShowMultiSelect) {
                let answer = await pro.run()
                let lint = file.get('lint-staged') || {}
                let lints = Object.assign(lint, {
                    ...answer.js,
                    ...answer.ts,
                    ...answer.css,
                })
                if (Object.keys(answer).length > 0) {
                    husky.hooks['pre-commit'] = 'lint-staged'
                    file.set('lint-staged', lints)
                }
            }
            file.set('husky', husky)
            let scripts = file.get('scripts')
            Object.assign(scripts, {
                commit: 'bk-commit',
            })
            if (answer.order === 'yes') {
                scripts.changelog = 'conventional-changelog -p angular -i CHANGELOG.md -s'
            }
            file.save()
            console.log(chalk.blue('分析依赖中...'))
            const devDependencies = file.get('devDependencies') || {}
            const dependencies = file.get('dependencies') || {}
            const allPackageName = Object.assign(devDependencies, dependencies)
            let installPackage = [
                'prettier',
                'eslint',
                'stylelint',
                'husky',
                'cross-env',
                'cz-conventional-changelog',
                'commitizen',
                '@commitlint/cli',
                '@commitlint/config-conventional',
                'lint-staged',
                'conventional-changelog-cli',
            ].filter(item => {
                return !allPackageName[item]
            })
            if (installPackage.length > 0) {
                let shell = require('shelljs')
                let allInstallPackage = installPackage.join(' ')
                console.log(chalk.blue(`开始安装依赖 ${npmName} i ${allInstallPackage} --save-dev`))
                shell.exec(`${npmName} i ${allInstallPackage} --save-dev`, {
                    async: false,
                })
                console.log(
                    chalk.green('初始化完成,可以使用 npm run commit 命令代替git commit操作')
                )
                return
            }
            console.log(chalk.green('初始化完成,可以使用 npm run commit 命令代替git commit操作'))
        })
        .catch(console.error)
} else {
  const bootstrap = require('commitizen/dist/cli/git-cz').bootstrap
    bootstrap({
        cliPath: path.join(__dirname, './node_modules/commitizen'),
        config: {
            path: 'cz-conventional-changelog',
        },
    })
}
