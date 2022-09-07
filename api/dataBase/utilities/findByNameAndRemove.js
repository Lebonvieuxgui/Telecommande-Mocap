export function findByNameAndRemove(name, data) {
    for (let i in data) {
        if (!data[i])
            continue;
        if (data[i].name == name) {
            delete data[i];
            return data;
        }
    }
    return false;
}