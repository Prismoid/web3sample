import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TextInput, StatusBar } from 'react-native';
import './global';
import abi from './abi.json';
import contract from './contractAddress.json';
import * as Random from 'expo-random';
import * as Crypto from 'expo-crypto';

// アプリケーション
export default function App() {
    // web3インスタンスの作成
    const Web3 = require('web3');
    const provider = "http://153.122.10.129:8545";
    const web3Provider = new Web3.providers.HttpProvider(provider);
    const web3 = new Web3(web3Provider);
    // コントラクトのアドレス
    const contractAddress = contract["contractAddress"];
    const contractAbi = abi;
    const myToken = new web3.eth.Contract(contractAbi, contractAddress);
    // useStateを利用した変数の宣言
    const [privateKey, setPrivateKey] = useState([]); // 秘密鍵
    const [address, setAddress] = useState([]); // アドレス
    const [balance, setBalance] = useState([]); // 残高
    const [name, setName] = useState([]); // 名前登録用
    const [value, setValue] = useState(1000); // 送金金額
    const [toName, setToName] = useState([]); // 
    
    //---------------------------------------------------//
    // web3を利用する関数群
    //---------------------------------------------------//
    const generatePrivateKey = async () => {
	try {
	    const rndUint8Array = await Random.getRandomBytesAsync(32);
	    const _privateKey = Buffer.from(rndUint8Array).toString('hex')
	    const _account = await web3.eth.accounts.privateKeyToAccount(_privateKey);
	    setPrivateKey(_privateKey);
	    setAddress(_account.address);	    
	} catch (error) {
	    console.error(error);
	}};
    // 残高確認
    const fetchAccountBalance = async (_address=address) => {
	try {
	    const _balance  = await myToken.methods.getBalance(_address).call();
	    setBalance(_balance);
	} catch (error) {
	    console.error(error);
	}};
    // 名前登録を実施
    const sendNameTx = async (_name=name) => {
	try {
	    // 既に登録されている名前か確認
	    const nameHash = web3.utils.soliditySha3(name);
	    const empty = await myToken.methods.setOwner(nameHash).call();
	    if (empty == false) { throw new Error("既に登録されている名前です"); };
	    // トランザクションデータの作成
	    const txData = myToken.methods.setOwner(nameHash).encodeABI();
	    const txCount = await web3.eth.getTransactionCount(address);
	    const txObject = {
		nonce:    txCount, 
		to:       contractAddress,
		value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
		gasLimit: web3.utils.toHex(3000000),
		gasPrice: web3.utils.toHex(web3.utils.toWei('0', 'gwei')),
		data: txData};
	    const signedTx = await web3.eth.accounts.signTransaction(txObject,privateKey);
	    alert("名前登録トランザクションを送信しています。");
	    const createReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	    alert("トランザクションが処理されました");
	} catch (error) {
	    alert(error);
	}};
    //
    const sendTransferTx = async (_value=value, _toName=toName) => {
	try {
	    // 残高が足りているか確認
	    const toAddress = await myToken.methods.getOwner(web3.utils.soliditySha3(_toName)).call();
	    const sufficient = await myToken.methods.transfer(_value, toAddress).call({from: address});
	    if (sufficient == false) { throw new Error("残高不足です"); };
	    // トランザクションデータの作成
	    const txData = myToken.methods.transfer(_value, toAddress).encodeABI();
	    const txCount = await web3.eth.getTransactionCount(address);
	    const txObject = {
		nonce:    txCount, 
		to:       contractAddress,
		value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
		gasLimit: web3.utils.toHex(3000000),
		gasPrice: web3.utils.toHex(web3.utils.toWei('0', 'gwei')),
		data: txData};
	    const signedTx = await web3.eth.accounts.signTransaction(txObject,privateKey);
	    alert("送金トランザクションを送信しています。");
	    const createReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	    alert("トランザクションが処理されました");
	} catch (error) {
	    alert(error);
	}};
    
    // パラメータ更新時の処理
    useEffect(() => { }, [privateKey, address]); // 空配列を渡すと、初回マウント時にのみ実行
    
    /* レンダリング部分 */
    return (
	<SafeAreaView style={styles.itemContainer}>
	    <Text style={styles.buttonText} onPress={async () => {generatePrivateKey(); }}>-> アカウント生成</Text>
	    <Text style={styles.text}>秘密鍵: { privateKey }</Text>
	    <Text style={styles.text}>アドレス: { address }</Text>
	    <Text style={styles.buttonText} onPress={async () => {fetchAccountBalance(address); }}>-> 残高確認</Text>
	    <Text style={styles.text}>金額: { balance }</Text>
	    <Text style={styles.buttonText} onPress={async () => { sendNameTx();  }}>-> 名前登録</Text>
	    <View style={{ flexDirection: 'row'}}>
		<Text style={styles.text}>登録する名前: </Text>
		<TextInput style={styles.input} mode="outlined" muiltiline onChangeText={setName} value={name} placeholder="test"/>
	    </View>
	    <Text style={styles.buttonText} onPress={async () => { sendTransferTx(value, toName); }}>-> 送金: </Text>
	    <View style={{ flexDirection: 'row'}}>
		<Text style={styles.text}>金額: </Text>
		<TextInput style={styles.input} mode="outlined" muiltiline onChangeText={setValue} value={value} placeholder="1000" keyboardType="numeric"/>
	    </View>
	    <View style={{ flexDirection: 'row'}}>
		<Text style={styles.text}>宛先(名前): </Text>
		<TextInput style={styles.input} mode="outlined" muiltiline onChangeText={setToName} value={toName} placeholder="test"/>
	    </View>
	</SafeAreaView>
    );
}

const styles = StyleSheet.create({
  itemContainer: {
      width: '100%',
      flexDirection: 'column',
      marginTop:StatusBar.currentHeight, 
  },
  text: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 24,
    color: 'blue',
  },
  input: {
      fontSize: 24, 
  }, 
});
