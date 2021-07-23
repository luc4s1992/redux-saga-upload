import logo from './logo.svg';
import Web3 from 'web3';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {useState, useEffect} from "react";

import abi from './utils/contractAbi.js'
import './App.css';
import {privateKey, contractAddress, rpcUrl} from "./utils/blockchainInfo";
import LoadingModal from "./component/modal/Loading_Modal";
import DataModal from "./component/modal/DataModal";
import { connect, useDispatch } from 'react-redux';
import request from 'utils/request';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

const tableHeader = [
    'id',
    'agent_key',
    'app',
    'cpu_system',
    'cpu_tot',
    'cpu_user',
    'down',
    'freemem',
    'hostname',
    'ip',
    'timestamp',
    'totalmem',
    'up',
    'usedmem'];

function getRandomNumber(en) {
    return Math.ceil(Math.random() * en ) % en + 1;
}

function getRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function App({fetch, tableDatas = []}) {

    useEffect(() => {
        setTableData(tableDatas)
    },[tableDatas[0]])

    const classes = useStyles();
    const web3 = new Web3(rpcUrl);
    const [tableData, setTableData] = useState([]);
    const [modal, setModalState] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [savedData, setSavedData] = useState([]);
    const [fetchId, setFetchId] = useState(0)

    function createData(name, calories, fat, carbs, protein) {
        return {name, calories, fat, carbs, protein};
    }

    const contract = new web3.eth.Contract(abi, contractAddress);
    // const query = contract.methods.upload(matrixData);
    // const encodedABI = query.encodeABI();
    // const signedTx = await this.web3.eth.accounts.signTransaction(
    //     {
    //         data: encodedABI,
    //         from: sender,
    //         gas: 2000000,
    //         to: contractAddress,
    //     },
    //     privateKey,
    //     false,
    // );
    // // @ts-ignore: property exists
    // return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const onGenerate = async () => {
        setLoading(true);
        //const rowNum = getRandomNumber(10);
        const rowNum = 10;
        const matrix = new Array(rowNum).fill(0).map(() => new Array(14).fill(0));
        
        for (let i = 0 ; i < rowNum ; i ++ ) {
            matrix[i][0] = (i + 1).toString();
            matrix[i][1] = getRandomString(15);
            matrix[i][2] = getRandomString(10);
            matrix[i][3] = getRandomNumber(100000).toString();
            matrix[i][4] = (getRandomNumber(100) / 10).toString();
            matrix[i][5] = (getRandomNumber(100) / 10).toString();
            matrix[i][6] = (getRandomNumber(10)).toString();
            matrix[i][7] = (getRandomNumber(20000)).toString();
            matrix[i][8] = getRandomString(7);
            matrix[i][9] = getRandomNumber(255) + '.' + getRandomNumber(255) + '.' + getRandomNumber(255)+ '.' + getRandomNumber(255);
            matrix[i][10] = (getRandomNumber(10) + 2000) + '-' + getRandomNumber(12) + '-' + getRandomNumber(31) + ' '
                + getRandomNumber(23) + ':' + getRandomNumber(59) + ':' + getRandomNumber(59);
            matrix[i][11] = getRandomNumber(20000).toString();
            matrix[i][12] = getRandomNumber(10).toString();
            matrix[i][13] = getRandomNumber(5000).toString();
        }

        const query = contract.methods.uploadData(matrix);
        const encodedABI = query.encodeABI();

        const sender = web3.eth.accounts.privateKeyToAccount(privateKey).address;

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                data: encodedABI,
                from: sender,
                gas: 4000000,
                to: contractAddress,
            },
            privateKey,
            false,
        );


        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        setTableData(matrix);

        setLoading(false);
    }

    const onView = async () => {
        setLoading(true);
        const data = await contract.methods.viewAllData().call();
        setSavedData(data);
        //setTableData(data);
        setLoading(false);
        setModalState(true);
    }

    const onClean = () => {
        setTableData([]);
    }

    const toRequest = (fetchId) => {
        request({url: '/fetch', method: 'POST', payload: {"id": fetchId}})
            .then((response) => setTableData(response.data))
    }

    return (
        <div className="App">
            <header className="App-header">

                <div className="App-title">
                    <h1> upload matrix data to blockchain(test binance) </h1>
                </div>

                <div className="App-button">
                    <input type="text" onChange={(e) => setFetchId(parseInt(e.target.value))} />
                    <div>
                        {/* <button onClick={() => toRequest(fetchId)}>Fetch</button> */}
                        <button onClick={() => fetch(fetchId)}>Fetch</button>
                    </div>
                    <div>
                        <button onClick={onGenerate}>generate & upload</button>
                    </div>
                    <div>
                        <button onClick={onClean}>clear</button>
                    </div>
                    <div>
                        <button onClick={onView} Style = {{color:'white'}}>view uploaded data</button>
                    </div>
                    <div>
                        <a href='https://testnet.bscscan.com/address/0xB9A3e6815AC817330499C6AF4577D83794c4C87b#code' target="_blank" style={{color:'#FFFFFF'}}>view contract</a>
                    </div>
                </div>
                <div style={{width: "100%", boxSizing: "border-box", padding: "20px"}}>
                    <TableContainer component={Paper} style={{}}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {tableHeader.map((row, key) => (
                                        <TableCell align={'center'} key={key}>{row}</TableCell>
                                    ))}

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData.map((rowData) => (
                                    <TableRow>
                                        { Object.keys(rowData).map((key) => (
                                            <TableCell align={'center'} key={key}>{rowData[key]}</TableCell>
                                            ))
                                        }
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </header>
            <LoadingModal isLoading = {isLoading}/>
            <DataModal isLoading = {modal} tableData = {savedData} setModalState={setModalState}/>
        </div>
    );
}

const mapStateToProps = (state) => ({
    tableDatas: state.data
})

const mapDispatchToProps = (dispatch) => ({
    fetch: (id) => dispatch({type:"fetch", payload: id})
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
// export default App;
