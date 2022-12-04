// SPDX-License-Identifier: MIT
pragma solidity 0.8.7; // コンパイラーのバージョン

struct Record {
    address owner;
    uint256 timestamp; 
}

contract MyToken {
    mapping(address => uint) public balances;
    mapping (bytes32 => Record) records;
    address contractCreater; 
    uint total_supply;

    // コンストラクタ
    constructor() { 
        contractCreater = msg.sender; 
        balances[msg.sender] = 0; 
        total_supply = 0;
    }

    // 送金関数(金額, 送金先アドレス)
    function transfer(uint _value, address _to) public returns(bool){
        if (balances[msg.sender] < _value) {
            return false; 
        } else {
            balances[msg.sender] -= _value; 
            balances[_to] += _value; 
            return true; 
        }
    }
    // トークンの所持量を調べる
    function getBalance(address _user) public view returns(uint){
        return balances[_user];
    }
    // 名前の登録
    function setOwner(bytes32 node) public returns(bool){
        if (records[node].owner == address(0)) { 
            records[node].owner = msg.sender; 
            balances[msg.sender] += 3000;
            return true;
        } else {
            return false;
        }
    }
    // 名前の所有権情報を確認する
    function getOwner(bytes32 node) public view returns(address){
        return records[node].owner;
    }
    
}