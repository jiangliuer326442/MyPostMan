## MyPostMan 简介

> 我非常注重您的隐私数据！！！
>
> MyPostMan 所有存储内容都是您和您的企业至关重要的数字化财产，由于笔者常年在银行这样的纯内网的环境中从事开发，MyPostMan 所有功能均不需要连接外部网络。所有数据都存储在您的个人电脑中，这样既保证了极高的性能，更重要的是确保了绝对的安全～

**MyPostMan** 是一款类似 PostMan 的接口请求软件，不同于 PostMan 的是，它按照 项目（微服务）、目录来管理我们的接口，基于迭代来管理我们的接口文档，按照迭代编写自动化测试用例，在不同环境中均可运行这些用例。

* 按照项目、文件夹管理我们的接口

![image-20240621221828706](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240621221828706.png)

* 接口详情可以查看我们接口的入参和返回示例、字段含义说明等

![image-20240619214833524](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619214833524.png)

* 每个迭代会包含多个项目、多个文件夹的接口。

![image-20240619215259964](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619215259964.png)

* 以迭代为单位，生成接口文档，可以标注一些这个迭代的注意事项，可导出分享，也可直接通过浏览器共享页面。

![image-20240619215501451](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619215501451.png)

![image-20240625212106236](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240625212106236.png)

* 把这个迭代涉及的一系列接口入参和返回串联起来调用，就构成了这个迭代接口的一个测试用例。

![image-20240619215948888](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619215948888.png)

![image-20240625212202033](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240625212202033.png)

* 我们迭代编写单测入参和断言支持大量常用的情景输入，如引起前面步骤的数据，读取项目环境变量数据等。

![image-20240619220331009](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619220331009.png)

* 发送网络请求，和 PostMan 相比，支持引用环境变量和使用随机数、随机字符串等作为参数。环境变量独立于项目和环境。

![image-20240621222447171](https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240621222447171.png)

## 软件下载

如果不想从源码一步步编译，可以从以下链接下载可执行文件：

windows 平台：
* 下载地址 1
    [ MyPostMan-Setup-0.0.3.exe](http://cdn.fanghailiang.cn/MyPostMan_Setup_0.0.3.exe)
* 下载地址 2
    [ MyPostMan-Setup-0.0.3.exe](https://gitee.com/onlinetool/mypostman/releases/download/v0.0.3/MyPostMan_Setup_0.0.3.exe)

mac 系统： 
* 下载地址 1
    [ MyPostMan-0.0.3.dmg](http://cdn.fanghailiang.cn/MyPostMan-0.0.3.dmg)
* 下载地址 2
    [ MyPostMan-0.0.3.dmg](https://gitee.com/onlinetool/mypostman/releases/download/v0.0.3/MyPostMan-0.0.3.dmg)

第一次使用软件，可以参照我们下面的新手指引一步步做，完成一个天气预报项目的接口文档编写，迭代自动化测试等。

## 开始旅程

### 准备接口调用 key

在以下教程中，我们使用聚合数据的（[天气预报](https://www.juhe.cn/docs/api/id/73)）相关接口演示如何使用  **MyPostMan** 进行接口调用、文档生成、自动化测试。

首先你需要申请一下 key，如果嫌麻烦，可以使用我的 `2c173c8a08cb275c6925c775c038903b` ，但有限额，你大概率调不通～[沮丧]

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617213801962-9322339.png" width="25%" />

### 环境、微服务、环境变量

在开始之前，先要设置好这些信息。我们企业中的环境一般分为开发、测试、预发布、线上等环境。通常我们只对某几个项目（微服务）拥有权限。不同的项目在不同环境中部署后，又会存在不同的访问地址，我们使用**环境变量**来管理这些在不同项目、不同运行环境中呈现不一样的字符串。

点击设置 -> 开发环境 -> 新增 来创建我们的开发环境

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617220409673-9322339.png" width="50%" />

点击设置 -> 微服务 -> 添加 来创建我们的项目

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617220824803-9322339.png" width="50%" />

在环境变量中设置我们这个项目在这个环境中，接口访问的 host 信息，点击设置->环境变量->选择项目（天气预报）->选择环境（本地环境）->api_host->编辑，下面填写的地址为 `http://apis.juhe.cn/simpleWeather/`  (注意，要求必须是以 `http:// ` 或者 `https://` 开头且以 /结尾的 url 地址)

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617221314708-9322339.png" width="50%" />

再新建一个环境变量，把我们准备阶段辛苦申请的 `appKey` 填进去。点击 设置 -> 环境变量 -> 添加。参数名称填写 **appKey**，参数值填写你刚刚申请的 key，我的填写 **2c173c8a08cb275c6925c775c038903b**

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617222042936-9322339.png" width="50%" />

以上这些，相当于我们初始化了一个项目。完成后效果如下

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617222343973-9322339.png" width="50%" />

### 迭代、接口测试、编写文档

我们这个天气预报项目 研发第一个迭代开发了两个接口：**查询支持的城市列表** 和 **根据城市查询未来天气**，

先创建一个迭代，在这个迭代里生产我们的接口文档，编写测试用例，最后迭代完成，接口合并到项目中，上线！

点击 设置 ->  版本迭代 -> 新增

我们现在通常是一个月一个迭代，因此我的迭代名称就是 **天气预报 2406**，因为我这个迭代涉及的项目就一个天气预报项目，所以微服务只选了一个。通常情况下，你们一个迭代会涉及很多个项目，都把它们选出来吧，多选漏选也无所谓，可以在 设置 -> 版本迭代 找到你的版本迭代，进行修改的。迭代说明是一个 markdown 的文案，这会在你们迭代的文档顶部展现出来，你、前端、测试 所有想要看迭代接口文档的人都会看到～

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617223431275-9322339.png" width="50%" />

当你的迭代上线后，可以关闭这个迭代，相当于归档，迭代变得不可修改，所有接口会按照关闭的先后顺序覆盖到你项目的接口列表中。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617224124719-9322339.png" width="50%" />

------------

测试一下我写的查询支持城市列表接口是否正确：请求 -> 发送请求，选择项目（天气预报）-> 选择环境（本地环境）->请求方式（GET）->地址（cityList），参数 `key` 值 **{{appKey}}** （“{{”开头，“}}”结尾的值会引用我们环境变量的数据，最终发送网络请求的数据是环境变量设置的值而不是这个字符串本身；这个界面就是参照 PostMan；在你输入“{{”时，会自动提示出这个项目下所有的环境变量，因此输入不会太困难;）。点击发送请求按钮可以得到下图的响应，代表查询天气预报接口是可用的。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617224843390-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617225516978-9322339.png" width="50%" />

点击**发送请求**按钮上面的 **保存** 按钮，把刚刚自测验证通过的接口保存到这个迭代文档中。

我们需要告诉其他人，这个接口是用来干什么的，传的那些字段是什么含义，返回的那些字段又是什么含义，这些在我们的迭代文档中都会有所体现。另外这个接口是属于哪个迭代的，如果这个迭代涉及的接口太多，我们还要通过文件夹在迭代这个池子中进行接口和接口的分类。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617225944198-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617230025740-9322339.png" width="25%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617230325802-9322339.png" width="20%" />

点击保存就在我们这个迭代中新建了第一个接口 ——查询支持的城市列表！

验证第二个接口，根据城市名称查询天气。请求->发送请求->选择项目->选择环境->请求方式（POST）->请求地址（query）。`key` 填写 `{{appKey}}` 读取 **appKey** 环境变量， `city` 填写 `上海`，代表查询上海这座城市的天气。发送请求得到以下响应：

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617230717963-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617230928028-9322339.png" width="25%" />

看起来接口没有问题，我们点击保存按钮把这个接口存入迭代的接口文档中吧！选择好迭代、文件夹，填好接口名称、字段含义，over

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617231339155-9322339.png" width="40%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617231452112-9322339.png" width="40%" />

下面看看我们的劳动成果，一份迭代的接口文档已经准备好了

在迭代导航下可以看到我们刚刚创建的迭代，点进来，可以看到这个迭代下面的接口列表，支持根据接口地址、接口说明、接口所属的项目（微服务），接口在迭代里的文件夹进行帅选；对接口列表的管理包括编辑、删除、设置排序值等。<u>在右下角漂浮着有一个迭代文档的按钮</u>

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617232158740-9322339.png" width="50%" />

点击迭代文档按钮，查看我们的迭代文档

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617232634539-9322339.png" width="40%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617232654549-9322339.png" width="40%" />

不对，这个接口文档就我一个人能看到有个 p 用啊。别急，页面右下角漂浮着一个导出按钮，点击。支持将迭代的接口文档导出成 markdown 和 html 两种格式。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617232856179-9322339.png" width="10%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240617233023302-9322339.png" width="10%" />

以下是导出的文档打开效果

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/weather_report_2406_markdown.png" width="40%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/weather_report_2406_html.jpeg" width="50%" />

### 编写单测用例、执行测试

上面，我们在编写接口文档时，已经大概测试了单个接口是可用的。实际上，这些接口不是单独存在的，他们需要根据特定的使用场景，按一定的规则将这些接口的入参、返回值串联起来，通过一步步的断言验证在这个特定场景下，接口返回信息是正确无误的。

以我们的天气预报项目为例，上面验证了 **上海** 这个城市查询天气是没有问题的，然而我们的实际场景是：从支持的城市列表中任意拿出一个城市，都要求必须能够查询出这个城市的天气，只有这样才能确保我们的接口是真的可用。

新建一个单测用例：从单测菜单找到我们的迭代**天气预报 2406**，点击添加，单测名称我写的是 **任意城市查询天气**，点击确定。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618073826853-9322339.png" width="50%" />

在这个单测用例中，包含两个步骤：

1. 查询城市列表
2. 从城市列表的返回中，任意选择一个城市名作为入参，查询该城市的天气

为了保证这些步骤顺利执行下去，每个步骤必须添加一个断言，断言失败终止执行测试用例，并告知亲在哪里断言出错了，入参是什么、返回是什么，方便你进行排查修复 bug。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618074515174-9322339.png" width="50%" />

从单测列表中找到你新加的单测，右边三个点中找到添加步骤入口

接口选择 **天气预报** 项目 的 **支持城市列表** 接口，其他使用默认值即可。注意 `Content-Type` 应该是 `application/x-www-form-urlencoded`。`{{appKey}}`会从接口关联的项目的环境变量中读取对应的环境变量值。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618074801086-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618074923541-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618075132697-9322339.png" width="50%" />

**<u>从表达式生成器中可以看到，支持的数据来源有 环境变量、固定值、还有从前面步骤实际调用过程中产生的 header、body、param、response 等数据。另外环境变量包含一些特殊的以 `$` 开头的字符串，它用于生成随机字符串、随机 int、随机 long 等数据。</u>** 这些是自动化单元测试的灵魂核心！

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618075457751-9322339.png" width="50%" />

下面填写返回断言：这个接口的断言是要求 **接口返回正确的错误码**，也就是 error_code 必须是 0

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618080338088-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618080439997-9322339.png" width="50%" />

最终生成下面的断言表达式，支持添加多个断言的，他们之间是且的关系。点击添加步骤按钮，添加我们第一个单元测试的第一个步骤。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618080506166-9322339.png" width="50%" />

我们可以试着运行一下测试用例，看一下效果，选择环境->本地环境，执行用例按钮点击。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618080742163-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618214339325-9322339.png" width="50%" />

从图中可以看到，我们的执行结果是成功的，也可以看到，我们每个步骤、接口调用的入参、返回值，断言两边的计算结果，方便我们在遇到失败时进行排障。

再接再厉，添加第二个接口，拿刚刚成功的获取城市列表接口返回的 **任意一个城市**作为入参，调用查询天气预报接口，断言接口返回的城市就是我们入参提供的来自于城市列表接口返回的任意城市。（有点绕，诶，看图）

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618215123134-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618215210932-9322339.png" width="50%" />

下面是高能区，仔细看图

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618215400630-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618215828836-9322339.png" width="50%" />

`result.*random().city` 是参数数据源的具体路径，result 下面是一个数据，我们选数组下面的任意的一个元素，拿到这个元素后，我们使用他的 **city** 字段作为入参。（放心，在输入“.”号时会自动触发语法提示，输入这些不会太难，你体验一下就知道了～）

点击确定，入参已经填好了

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618220120188-9322339.png" width="50%" />

下面添加返回断言，我的断言名称是 **接口的返回城市名称字段需要与入参的城市名一致**

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618220312046-9322339.png" width="50%" />

这个能看懂吧？我们拿当前步骤执行结果中的 `result.city` 路径的数据作为断言的左侧。

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618220453663-9322339.png" width="50%" />

这个是拿我们当前步骤 body 入参的 `city` 路径的实际数值作为断言比较的对象，结果如下：

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618220612691-9322339.png" width="50%" />

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618220646552-9322339.png" width="50%" />

可以看到，我们已经添加好了两个步骤，下面在 **本地环境** 下执行我们的用例。

返回成功的截图我就不发了，看一下我们第二个接口的入参：

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618220937586.png" width="50%" />

我们从城市列表接口的返回中随机取了一个叫 **酒泉** 的城市查询了天气预报，返回的城市名称正是**酒泉**，断言成功！

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240618221138782-9322339.png" width="50%" />

好了，我们的入门教程就到这里，其他功能，比如备份、还原数据库，从 PostMan 导入接口到项目等功能，自行探索。啰嗦一句，最好定时备份一下数据库！

## 与作者交互

您对软件有任何批评建议，可以加我微信沟通，二维码如下：

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619222612484.png" width="50%" />

软件目前所有功能均不收费，无需连接外部网络即可使用。如果觉得帮到了你，可以不吝打赏一个鸡腿哦，打赏二维码如下：

<img src="https://gitee.com/onlinetool/mypostman/raw/master/doc/images/image-20240619222828912.png" width="50%" />

最后最最重要的是，如果你恰好有个坑位，不妨介绍给我，坐标 - 上海。