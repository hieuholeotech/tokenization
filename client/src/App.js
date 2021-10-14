import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";


import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false,kycAddress:"",tokenSaleAddress:null,userTokens:0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
     
      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );
      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenUserTokenTransfer();
      this.setState({loaded:true,tokenSaleAddress:MyTokenSale.networks[this.networkId].address},this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  updateUserTokens = async()=>{
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens :userTokens});
  }
  listenUserTokenTransfer = ()=>{
    this.tokenInstance.events.Transfer({to:this.accounts[0]}).on("data",this.updateUserTokens);
  }
  handleByTokens = async()=>{
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from:this.accounts[0],value:this.web3.utils.toWei("1","Wei")});
  }
 handleInputChange =(event)=>{
   const target = event.target;
   const value  = target.type==="checkbox" ? target.checked :target.value; 
   const name   = target.name;
  
   this.setState({
     [name]:value
   });
 }
handleKycWhitelisting =async () =>{
  if(this.state.kycAddress===""){
    alert("Lỗi - Address không được bỏ trống");
  }
  else{
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from:this.accounts[0]});
    alert("KYC for"+this.state.kycAddress+" is completed");
  }
  
};

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
     
    <div className="wrap">
        <div className="container">
            <div className="row">
                <div className="col-md-8 col-12">
                    <div className="center-inner-left">
                        <div className="inner-left">
                            <h1 className="banner-title">CAPPU TOKEN SALE</h1>
                            <div class="content">
                                <h3>KYC Whitelist</h3>
                                    <div class="p-ralative">
                                        <input type="text" class="form-control" name="kycAddress" placeholder="Address to allow" value={this.state.kycAddress} onChange={this.handleInputChange} />
                                        <button class="btn btn-primary btn-atw" onClick={this.handleKycWhitelisting}>Add to whitelist</button>
                                    </div>
                                <div class="buy-token mt-3">
                                    <p class="tut">If you want to buy tokens, send Wei to this address: 
                                        <code>{this.state.tokenSaleAddress}</code> 
                                    </p>
                                    <p class="balance"> Your  currently have: <span>{this.state.userTokens} CAPPU Token </span></p>
                                    <button class="btn btn-primary bmt-btn" onClick={this.handleByTokens}>Buy More Token</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-12">

                </div>
                
            </div>
        </div>
        <div className="footer-sign">
            <img src="../hieu.png" className="hiu"/>
            <img src="../chi.png" className="chi"/>
        </div>
        
    </div>
    );
  }
}

export default App;
