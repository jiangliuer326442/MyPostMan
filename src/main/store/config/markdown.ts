import log from 'electron-log';

import getCache from './index';

const TABLE_NAME = "iterator.markdown";

let iterator_uuid_cache = {};

export function setIteratorCache(uuid:string, salt:string) {
    iterator_uuid_cache[uuid] = salt;

    let cache = getCache("");
    cache.set(TABLE_NAME + "." + uuid, salt);
    log.debug(cache.get(TABLE_NAME));
}

export function getSalt(uuid:string) : string {
    let salt = iterator_uuid_cache[uuid];
    if (salt === undefined || salt === '') {
        let cache = getCache("");
        let salt = cache.get(TABLE_NAME + "." + uuid);
        if (salt === undefined || salt === '') {
            return "";
        } else {
            iterator_uuid_cache[uuid] = salt;
            return salt;
        }
    }
    return salt;
}