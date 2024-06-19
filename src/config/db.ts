export const DB_NAME = "mypostman";
export const FIELD_ID = "id";

export const TABLE_ENV_NAME = "env";
export const TABLE_ENV_FIELDS = {
    FIELD_LABEL : "label",
    FIELD_REMARK : "remark",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_MICRO_SERVICE_NAME = "microservices";
export const TABLE_MICRO_SERVICE_FIELDS = {
    FIELD_LABEL : "label",
    FIELD_REMARK : "remark",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_ENV_VAR_NAME = "env_vars";
export const TABLE_ENV_VAR_FIELDS = {
    FIELD_ENV_LABEL : "env",
    FIELD_MICRO_SERVICE_LABEL : "microservices",
    FIELD_PARAM_NAME : "param_name",
    FIELD_PARAM_VAR : "param_var",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_ENV_KEY_NAME = "microservices_keys";
export const TABLE_ENV_KEY_FIELDS = {
    FIELD_MICRO_SERVICE_LABEL : "microservices",
    FIELD_PARAM_NAME : "param_name",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_VERSION_ITERATION_NAME = "version_iteration";
export const TABLE_VERSION_ITERATION_FIELDS = {
    FIELD_UUID : "uuid",
    FIELD_MASTER_UUID : "master_uuid",
    FIELD_NAME : "title",
    FIELD_CONTENT : "content",
    FIELD_PROJECTS : "projects",
    FIELD_OPENFLG : "open_flg",
    FIELD_CLOSE_TIME : "close_time",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_VERSION_ITERATION_FOLD_NAME = "version_iteration_folders";
export const TABLE_VERSION_ITERATION_FOLD_FIELDS = {
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_PROJECT : "project",
    FIELD_FOLD_NAME : "name",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_REQUEST_HISTORY_NAME = "request_history";
export const TABLE_REQUEST_HISTORY_FIELDS = {
    FIELD_ID : FIELD_ID,
    FIELD_ENV_LABEL : "env",
    FIELD_MICRO_SERVICE_LABEL : "microservices",
    FIELD_URI : "uri",
    FIELD_REQUEST_METHOD : "method",
    FIELD_REQUEST_HEADER : "header",
    FIELD_REQUEST_BODY : "body",
    FIELD_REQUEST_PARAM : "param",
    FIELD_RESPONSE_CONTENT : "content",
    FIELD_JSONFLG : "json_flg",
    FIELD_HTMLFLG : "html_flg",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_JSON_FRAGEMENT_NAME = "json_fragment";
export const TABLE_JSON_FRAGEMENT_FIELDS = {
    FIELD_NAME : "name",
    FIELD_HASH : "hash",
    FIELD_DTYPE : "dtype",
    FIELD_REMARK : "remark",
    FIELD_FIELDS : "fields",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_VERSION_ITERATION_REQUEST_NAME = "version_iteration_request";
export const TABLE_VERSION_ITERATION_REQUEST_FIELDS = {
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_MICRO_SERVICE_LABEL : "microservices",
    FIELD_TITLE : "title",
    FIELD_SORT : "sort",
    FIELD_FOLD : "fold",
    FIELD_URI : "uri",
    FIELD_REQUEST_METHOD : "method",
    FIELD_REQUEST_HEADER : "header",
    FIELD_REQUEST_HEADER_HASH : "header_hash",
    FIELD_REQUEST_BODY : "body",
    FIELD_REQUEST_BODY_HASH : "body_hash",
    FIELD_REQUEST_PARAM : "param",
    FIELD_REQUEST_PARAM_HASH : "param_hash",
    FIELD_RESPONSE_CONTENT : "response",
    FIELD_RESPONSE_HASH : "response_hash",
    FIELD_RESPONSE_DEMO : "response_demo",
    FIELD_JSONFLG : "json_flg",
    FIELD_HTMLFLG : "html_flg",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_PROJECT_REQUEST_NAME = "project_request";
export const TABLE_PROJECT_REQUEST_FIELDS = {
    FIELD_PROJECT_LABEL : "project",
    FIELD_TITLE : "title",
    FIELD_SORT : "sort",
    FIELD_FOLD : "fold",
    FIELD_URI : "uri",
    FIELD_REQUEST_METHOD : "method",
    FIELD_REQUEST_HEADER : "header",
    FIELD_REQUEST_HEADER_HASH : "header_hash",
    FIELD_REQUEST_BODY : "body",
    FIELD_REQUEST_BODY_HASH : "body_hash",
    FIELD_REQUEST_PARAM : "param",
    FIELD_REQUEST_PARAM_HASH : "param_hash",
    FIELD_RESPONSE_CONTENT : "response",
    FIELD_RESPONSE_HASH : "response_hash",
    FIELD_RESPONSE_DEMO : "response_demo",
    FIELD_JSONFLG : "json_flg",
    FIELD_HTMLFLG : "html_flg",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_UNITTEST_FOLD_NAME = "unittest_fold";
export const TABLE_UNITTEST_FOLD_FIELDS = {
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_FOLD_NAME : "name",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_UNITTEST_NAME = "unittest";
export const TABLE_UNITTEST_FIELDS = {
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_UUID : "uuid",
    FIELD_TITLE : "title",
    FIELD_FOLD_NAME : "fold",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_UNITTEST_STEPS_NAME = "unittest_steps";
export const TABLE_UNITTEST_STEPS_FIELDS = {
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_UNITTEST_UUID : "unittest_uuid",
    FIELD_UUID : "uuid",
    FIELD_TITLE : "title",
    FIELD_SORT : "sort",
    FIELD_MICRO_SERVICE_LABEL : "microservices",
    FIELD_URI : "uri",
    FIELD_REQUEST_METHOD : "method",
    FIELD_REQUEST_HEADER : "header",
    FIELD_REQUEST_PARAM : "param",
    FIELD_REQUEST_BODY : "body",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_UNITTEST_STEP_ASSERTS_NAME = "unittest_asserts";
export const TABLE_UNITTEST_STEP_ASSERT_FIELDS = {
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_UNITTEST_UUID : "unittest_uuid",
    FIELD_STEP_UUID : "step_uuid",
    FIELD_UUID : "uuid",
    FIELD_TITLE : "title",
    FIELD_ASSERT_LEFT : "assert_left",
    FIELD_ASSERT_OPERATOR : "assert_operator",
    FIELD_ASSERT_RIGHT : "assert_right",
    FIELD_CUID : "create_uid",
    FIELD_CUNAME : "create_uname",
    FIELD_CTIME : "create_time",
    FIELD_DELFLG : "del_flg",
}

export const TABLE_UNITTEST_EXECUTOR_NAME = "unittest_executor";
export const TABLE_UNITTEST_EXECUTOR_FIELDS = {
    FIELD_BATCH_UUID : "batch_uuid",
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_UNITTEST_UUID : "unittest_uuid",
    FIELD_STEPS_UUID : "steps_uuid",
    FIELD_REQUEST_HEADER : "header",
    FIELD_REQUEST_PARAM : "param",
    FIELD_REQUEST_BODY : "body",
    FIELD_REQUEST_RESPONSE : "response",
    FIELD_ASSERT_LEFT : "assert_left",
    FIELD_ASSERT_RIGHT : "assert_right",
    FIELD_RESULT : "result",
    FIELD_COST_TIME : "cost_time",
    FIELD_DELFLG : "del_flg",
    FIELD_CTIME : "create_time",
}

export const TABLE_UNITTEST_EXECUTOR_REPORT_NAME = "unittest_executor_report";
export const TABLE_UNITTEST_EXECUTOR_REPORT_FIELDS = {
    FIELD_BATCH_UUID : "batch_uuid",
    FIELD_ENV : "env",
    FIELD_ITERATOR_UUID : "iterator_uuid",
    FIELD_UNITTEST_UUID : "unittest_uuid",
    FIELD_RESULT : "result",
    FIELD_COST_TIME : "cost_time",
    FIELD_REASON : "failure_reason",
    FIELD_DELFLG : "del_flg",
    FIELD_CTIME : "create_time",
}