//环境管理
export const ENV_LIST_ROUTE = "/envs";
//微服务管理
export const PROJECT_LIST_ROUTE = "/projects";
//环境变量管理
export const ENVVAR_LIST_ROUTE = "/envvars";
//版本迭代管理
export const VERSION_ITERATOR_LIST_ROUTE = "/version_iterators";
//版本迭代详情
export const VERSION_ITERATOR_DETAIL_ROUTE = "/version_iterator/:uuid";
//添加版本迭代
export const VERSION_ITERATOR_ADD_ROUTE = "/version_iterator_add";
//网络请求
export const INTERNET_REQUEST = "/internet_request_send";
//根据请求历史获得网络请求
export const INTERNET_REQUEST_BY_HISTORY_ROUTE = "/internet_request_send_by_history/:id";
//根据迭代 api 获得网络请求
export const INTERNET_REQUEST_BY_API_ROUTE = "/internet_request_send_by_api/:params";
//保存到迭代
export const REQUEST_TO_ITERATOR_ROUTE = "/request_to_interator/:id";
//迭代接口列表
export const REQUEST_ITERATOR_LIST_ROUTE = "/version_iterator_requests/:id"
//迭代接口详情
export const REQUEST_ITERATOR_DETAIL_ROUTE = "/version_iterator_request/:params"
//迭代单测列表
export const UNITTEST_ITERATOR_LIST_ROUTE = "/version_iterator_tests/:id"
//迭代单测执行列表
export const UNITTEST_ITERATOR_EXECUTOR_LIST_ROUTE = "/unittest_executor_record/:env/:iteratorId/:unitTestId"
//迭代单测步骤新增
export const UNITTEST_STEP_ADD_ROUTE = "/version_iterator_tests_step_add/:iteratorId/:unitTestUuid"
//迭代单测步骤编辑
export const UNITTEST_STEP_EDIT_ROUTE = "/version_iterator_tests_step_edit/:iteratorId/:unitTestUuid/:unitTestStepUuid"
//请求历史
export const REQUEST_HISTORY = "/request_history";
//迭代文档
export const VERSION_ITERATOR_DOC_ROUTE = "/version_iterator_doc/:uuid";
//项目接口列表
export const REQUEST_PROJECT_LIST_ROUTE = "/project_requests/:id"

export const WELCOME_ROUTE = "/";