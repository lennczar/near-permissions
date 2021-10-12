import { Context, Storage, ContractPromise, PersistentUnorderedMap } from 'near-sdk-as';

const whitelist = new PersistentUnorderedMap<string, u8>('_def');
whitelist.set(Context.contractName, 3);

export function initContract(account_id: string): void {
    assert(Storage.get<string>("init") == null, "Already initialized");
    whitelist.set(account_id, 3);
    Storage.set("init", true);
}

function _has_permission(level: u8): void {
    assert(whitelist.contains(Context.predecessor) && whitelist.getSome(Context.predecessor) >= level, `${Context.predecessor} has insufficent permissions.`);
}

export function getPermissionLevel(): u8 {
    return whitelist.contains(Context.predecessor)
        ? whitelist.getSome(Context.predecessor)
        : 0;
}

export function grantPermissionLevel(account_id: string, level: u8): void {
    _has_permission(3);
    whitelist.set(account_id, level);
}

export function getSender(): string {
    _has_permission(1);
    return Context.sender;
}

export function getPredecessor(): string {
    _has_permission(1);
    return Context.predecessor;
}

export function getContractName(): string {
    _has_permission(1);
    return Context.contractName;
}

export function callContract(adress: string, func: string): void {
    _has_permission(2);
    let promise = ContractPromise.create(
        adress,
        func,
        "{}",
        100000000000000
    );
    promise.returnAsResult();
}

export function reset(): void {
    whitelist.clear();
    Storage.delete("init");
}
