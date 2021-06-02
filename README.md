# @tencent/bk-commit

自动化验证 git commit 格式

# @tencent/bk-commit

### 前言

在多人协作项目中，如果代码风格统一、代码提交信息的说明准确，那么在后期协作以及 Bug 处理时会更加方便。Git 每次提交代码，都要写 Commit message（提交说明），否则就不允许提交。一般来说，commit message 应该清晰明了，说明本次提交的目的。

Commit message 的作用

- 提供更多的历史信息，方便快速浏览
- 过滤某些 commit（比如文档改动），便于快速查找信息
- 直接从 commit 生成 Change log
- 可读性好，清晰，不必深入看代码即可了解当前 commit 的作用。
- 为 Code Reviewing（代码审查）做准备
- 方便跟踪工程历史
- 提高项目的整体质量，提高个人工程素质

Commit message 格式为

```
 <type>(<scope>): <subject>
// 空一行
<body>
// 空一行
<footer>
```

为了符合规范在这里 `@tencent/bk-commit` 将做了一下几件事

- 在 git commit 提交时对 commit message 格式验证,如果不符合则终止 commit。
- 为了方便输入格式 加入了终端自动化流程选择格式信息。
- 在初始化阶段可以选择对提交对代码 配置代码格式化验证 比如在 commit 提交时通过配置 eslit --fix 来修复代码不规范 如果修复失败则终止。
- 将所有用到对 npm 包依赖及基本配置全部自动生成。

# @tencent/bk-commit 使用

```
 // 下载 @tencent/bk-commit
 tnpm install @tencent/bk-commit -D

 // 初始化依赖包及配置项
 npx bk-commit init

 // 使用自动化选择message

 tnpm run commit
```

#### 自动化流程

运行 `npm run commit` 后流程如下

- 选择 commit 类型（type）
- 输入影响范围 (scope)
- 填写描述 （subject）
- 填写 body(如果要编写多行 请使用\n 换行 回车直接结束描述, 非必填)
- 填写 breakchange 信息 没有直接否
- 填写 issue 相关信息

#### 初始化中对选项：

- 输入安装依赖的工具包 默认是`npm`
- 是否在提交是对代码进行 `prettier` 格式化（格式化的规范按自身项目是否配置 `prettier` 规则 如果没有，则按官网默认规则）
- 是否在提交是对代码进行 `eslint` 格式化（格式化的规范按自身项目是否配置 `eslint` 规则 如果没有，则按默认规则）
- 是否使用changelog,运行命令自动生成commit日志 (配置后 当运行 `npm run changelog` 会在根目录生成 `CHANGELOG.md`)


## 注意点

- 所有生成的配置都可以在 `package.json`中二次修改，直接影响运行结果
- 如果不使用 `npm run commit` 命令 直接使用 `git cimmit -m xxxx` 如果有配置格式化代码，会对代码进行格式化流程再对 commit message 进行验证
- 重新 init 之前在 package.json 中已经存在的配置会取合并之后的

### 关于规则

```
// 提交格式 类型 及描述为必填项

type (必填)<scope>(可选): subject(必填)
```
type 默认简化为 



type 定义了基本常用的几种，自行定义可以参考 `@commitlint/config-conventional`类型

###### 例如常用：

- feature：新功能（feature）
- bugfix：修补 bug
- docs：文档（documentation）
- minor： 格式 拼写（不影响代码运行的变动）
- chore：构建过程或辅助工具的变动
- merge：分支操作
- optimization: 功能优化

##### 当你需要配置自己的 type 替换默认的时

在 `package.json 中修改配置 commitizen的types 和 commitlint的 type-enum`


##### 初始化后修改配置的方式有哪些

- 重新 init 选择
- 在 package.json 中修改配置

package 增加的可配置项

```
// commitlint对象可配置规则 参考 npm包@commitlint/config-conventional

// config.commitizen 中的types对象的 description 属性 可以配置自动化选择时的type文案

// husky.hook 对象中可以配置钩子命令 参考 git hooks

// lint-staged 对象可以配置代码格式化的流程 目前可选择支持 js, ts的处理 如果需要配置css,HTML 等可以自行增加

```


#### 目前只对 git commit 进行验证操作，自动化需要执行 `npm run commit` 开启，，后续考虑拦截 git commit 将自动化前置