import { 
    TABLE_VERSION_ITERATION_REQUEST_NAME, 
    TABLE_VERSION_ITERATION_REQUEST_FIELDS 
} from '../../config/db';
import { isStringEmpty } from '../util';

let iteration_request_iteration_uuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_ITERATOR_UUID;
let iteration_request_project = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_MICRO_SERVICE_LABEL;
let iteration_request_method = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_METHOD;
let iteration_request_title = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_TITLE;
let iteration_request_sort = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_SORT;
let iteration_request_fold = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_FOLD;
let iteration_request_uri = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_URI;
let iteration_request_header = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER;
let iteration_request_header_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_HEADER_HASH;
let iteration_request_body = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY;
let iteration_request_body_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_BODY_HASH;
let iteration_request_param = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM;
let iteration_request_param_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_REQUEST_PARAM_HASH;
let iteration_request_response = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_CONTENT;
let iteration_request_response_hash = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_HASH;
let iteration_request_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;
let iteration_request_jsonFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_JSONFLG;
let iteration_request_htmlFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_HTMLFLG;
let iteration_request_cuid = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CUID;
let iteration_request_cuname = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CUNAME;
let iteration_request_delFlg = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_DELFLG;
let iteration_request_ctime = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_CTIME;

export async function getVersionIteratorRequest(iteration_uuid : string, project : string, method : string, uri : string) {
    await window.db.open();

    let version_iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
    .equals([ iteration_uuid, project, method, uri ])
    .first();
    if (version_iteration_request === undefined || version_iteration_request[iteration_request_delFlg] !== 0) {
        return null;
    }
    return version_iteration_request;
}

export async function delVersionIteratorRequest(record, cb) {
    await window.db.open();

    let iteration_uuid = record[iteration_request_iteration_uuid];
    let project = record[iteration_request_project];
    let method = record[iteration_request_method];
    let uri = record[iteration_request_uri];

    let version_iteration_request = await getVersionIteratorRequest(iteration_uuid, project, method, uri);
    if (version_iteration_request !== undefined) {
        version_iteration_request[iteration_request_delFlg] = 1;
        console.debug("delVersionIteratorRequest", version_iteration_request);
        await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
        cb();
    }
}

export async function getVersionIteratorRequestsByProject(iteration_uuid : string, project : string, fold : string | null, title : string, uri : string) {
    await window.db.open();

    let version_iteration_requests = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_delFlg, iteration_request_iteration_uuid ])
    .equals([ 0, iteration_uuid ])
    .filter(row => {
        if (!isStringEmpty(title)) {
            if (row[iteration_request_title].indexOf(title) < 0) {
                return false;
            }
        }
        if (!isStringEmpty(uri)) {
            if (row[iteration_request_uri].toLowerCase().indexOf(uri.toLowerCase()) < 0) {
                return false;
            }
        }
        if (!isStringEmpty(project)) {
            if (row[iteration_request_project] !== project) {
                return false;
            }
        }
        if (!isStringEmpty(fold) || fold === "") {
            if (row[iteration_request_fold] !== fold || row[iteration_request_project] !== project) {
                return false;
            }
        }
        return true;
    })
    .reverse()
    .toArray();

    version_iteration_requests.sort((a, b) => {
        if (a[iteration_request_sort] === undefined) {
            a[iteration_request_sort] = 0;
        }
        if (b[iteration_request_sort] === undefined) {
            b[iteration_request_sort] = 0;
        }
        return b[iteration_request_sort] - a[iteration_request_sort];
    })
    
    return version_iteration_requests;
}

export async function editVersionIteratorRequest(
    initMethod : string, initUri : string,
    iteration_uuid : string, project : string, method : string, uri : string, 
    title: string, fold: string, header: object, body: object, param: object, response: object
) {
    window.db.transaction('rw',
        window.db[TABLE_VERSION_ITERATION_REQUEST_NAME],
        async () => {
            //未改动基础，只修改
            if (initMethod === method && initUri === uri) {
                let version_iteration_request = await getVersionIteratorRequest(iteration_uuid, project, method, uri);
                version_iteration_request[iteration_request_title] = title;
                version_iteration_request[iteration_request_fold] = fold;
                version_iteration_request[iteration_request_header] = header;
                version_iteration_request[iteration_request_body] = body;
                version_iteration_request[iteration_request_param] = param;
                version_iteration_request[iteration_request_response] = response;
            
                console.debug("addVersionIteratorRequest", version_iteration_request);
            
                await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
            } else {
                let version_iteration_request = await getVersionIteratorRequest(iteration_uuid, project, initMethod, initUri);
                version_iteration_request[iteration_request_delFlg] = 1;
                console.debug("delVersionIteratorRequest", version_iteration_request);
                await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
                
                version_iteration_request[iteration_request_method] = method;
                version_iteration_request[iteration_request_uri] = uri;
                version_iteration_request[iteration_request_title] = title;
                version_iteration_request[iteration_request_fold] = fold;
                version_iteration_request[iteration_request_header] = header;
                version_iteration_request[iteration_request_body] = body;
                version_iteration_request[iteration_request_param] = param;
                version_iteration_request[iteration_request_response] = response;
                version_iteration_request[iteration_request_delFlg] = 0;
            
                console.debug("addVersionIteratorRequest", version_iteration_request);
                await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
            }

        }
    );
}

export async function addVersionIteratorRequest(
    iteration_uuid : string, project : string, method : string, uri : string, 
    title: string, fold: string, 
    header: object, headerHash: string, body: object, bodyHash: string, param: object, paramHash: string, response: object, responseHash: string, response_demo: object,
    json_flg: boolean, html_flg: boolean,
    device) {
    await window.db.open();

    let version_iteration_request : any = {};
    version_iteration_request[iteration_request_iteration_uuid] = iteration_uuid;
    version_iteration_request[iteration_request_project] = project;
    version_iteration_request[iteration_request_method] = method;
    version_iteration_request[iteration_request_uri] = uri;
    version_iteration_request[iteration_request_title] = title;
    version_iteration_request[iteration_request_fold] = fold;
    version_iteration_request[iteration_request_header] = header;
    version_iteration_request[iteration_request_header_hash] = headerHash;
    version_iteration_request[iteration_request_body] = body;
    version_iteration_request[iteration_request_body_hash] = bodyHash;
    version_iteration_request[iteration_request_param] = param;
    version_iteration_request[iteration_request_param_hash] = paramHash;
    version_iteration_request[iteration_request_response] = response;
    version_iteration_request[iteration_request_response_hash] = responseHash;
    version_iteration_request[iteration_request_response_demo] = response_demo;
    version_iteration_request[iteration_request_jsonFlg] = json_flg;
    version_iteration_request[iteration_request_htmlFlg] = html_flg;
    version_iteration_request[iteration_request_cuid] = device.uuid;
    version_iteration_request[iteration_request_cuname] = device.uname;
    version_iteration_request[iteration_request_ctime] = Date.now();
    version_iteration_request[iteration_request_delFlg] = 0;
    console.debug("addVersionIteratorRequest", version_iteration_request);

    await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
}

export async function setVersionIterationRequestSort(iteratorId : string, project : string, method : string, uri : string, sort : number, cb : () => void) {
    let version_iteration_request = await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME]
    .where([ iteration_request_iteration_uuid, iteration_request_project, iteration_request_method, iteration_request_uri ])
    .equals([ iteratorId, project, method, uri ])
    .first();
    if (version_iteration_request === undefined || version_iteration_request[iteration_request_delFlg] !== 0 || version_iteration_request[iteration_request_sort] == sort) {
        return;
    }
    version_iteration_request[iteration_request_sort] = sort;

    console.debug("setVersionIterationRequestSort", version_iteration_request);

    await window.db[TABLE_VERSION_ITERATION_REQUEST_NAME].put(version_iteration_request);
    
    cb();
}