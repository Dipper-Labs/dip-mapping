<template>
  <div class="home">
    <el-card class="box-card">
      <div>{{$t('tips')}}</div>
      <div>
        <a href="https://docs.dippernetwork.com/mapping/mapping.html" target="_blank">{{$t('oppical_doc')}}</a>
      </div>
      <div
        slot="header"
        class="clearfix"
      >
        <span>{{$t('title')}}</span>
        <!-- <el-button
          style="float: right; padding: 3px 0"
          type="text"
        >操作按键</el-button> -->
        <el-dropdown class="language" @command="changeLanguage">
          <span class="el-dropdown-link">
            {{$t('change')}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh">中文</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <p>
        <el-button
          class="card-button"
          type="primary"
          :disabled="buttonDisabled.connectDisabled"
          @click="connectClick"
        >{{connectButton}}</el-button>
      </p>
      <!-- <p>
        <el-button
          type="primary"
          class="card-button"
          :disabled="buttonDisabled.getAccountDisabled"
          @click="getAccounts"
        >GetAccount</el-button>
      </p> -->
      <!-- <p>
        <el-button
          type="primary"
          class="card-button"
          @click="getAmountTotal"
        >Wallet</el-button>
      </p> -->
      <p>
        <el-alert
          :title="`${$t('account')}${accountResults}`"
          type="info"
          :closable="false"
          effect="dark"
        >
        </el-alert>
      </p>
      <div>{{$t('your_eth')}}{{amount}}</div>
      <div>{{$t('you_dip')}}:{{amount1}}</div>
      <p>
        <el-alert
          :title="`${$t('dip_main_erc20')}${distAccount}`"
          type="info"
          :closable="false"
          effect="dark"
        >
        </el-alert>
      </p>
      <el-form label-width="150px">
        <el-form-item :label="$t('dip_main')">
          <el-input
            v-model="mapAddress"
            :placeholder="$t('please_input')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('mapping_amount')">
          <el-input
            v-model="amount_imput"
            :placeholder="$t('max_tips')"
          >
            <template slot="append">DIP</template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <p>
      <el-button
        type="primary"
        @click="toApprove"
        :disabled="btnStatus.b1disable"
      >{{$t('approve')}}</el-button>
      <el-button
        type="primary"
        @click="toMapping"
        :disabled="btnStatus.b2disable"
      >{{$t('mapping')}}</el-button>
    </p>
  </div>
</template>

<script>
import MetaMaskOnboarding from "@metamask/onboarding";
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      connectButton: "Connect",
      connectType: "NOINSTALL",
      connectStatus: "未安装",
      connectStatusList: [
        { name: "未安装" },
        { name: "未连接" },
        { name: "已连接" }
      ],
      buttonDisabled: {
        connectDisabled: false,
        getAccountDisabled: true
      },
      onboarding: null,
      forwarderOrigin: "",
      distAccount: "0xD14f2f1e32e2Dd4C17DFA27f1393815674e2adA2",
      accountResults: "", // 我的账户
      mapAddress: "",
      amount: "",
      amount1: "",
      amount_imput: "",
      btnStatus:{b1disable:true,b2disable:true}
    };
  },
  computed: {},
  async mounted() {
    this.forwarderOrigin = window.location.origin;
    this.onboarding = new MetaMaskOnboarding({
      forwarderOrigin: this.forwarderOrigin
    });

    window.addEventListener("DOMContentLoaded", this.initialize);
  },
  methods: {
    ...mapMutations({
      SETLANG: "SETLANG"
    }),
    async initialize() {
      // 初始化按键状态
      this.updateButtons();
      if (this.isMetaMaskInstalled()) {
        // ???
        ethereum.autoRefreshOnNetworkChange = false;
        // ???
        // this.getNetworkAndChainId();
        // 监听事件绑定
        this.handleMethodsBind();

        // ethereum.on("networkChanged", handleNewNetwork);
        // ethereum.on("accountsChanged", handleNewAccounts);

        // 初始化获取账户地址
        try {
          // 获取账户地址
          await this.getAccounts();
          // 更新按键状态
          this.updateButtons();
          // 获取账户总金额
          if (this.isMetaMaskConnected()) this.getAmountTotal();
        } catch (err) {
          console.error("Error on init when getting accounts", err);
        }
      }
    },
    // 按键状态更新
    updateButtons() {
      let isMetaMaskInstalled = this.isMetaMaskInstalled();
      let isMetaMaskConnected = this.isMetaMaskConnected();

      // 判断是否已安装
      if (!isMetaMaskInstalled) {
        this.connectType = "NOINSTALL";
        this.connectStatus = "未安装";
        this.buttonDisabled.connectDisabled = false;
        this.connectButton = "Click here to install MetaMask!";
      } else if (isMetaMaskConnected) {
        this.connectType = "CONNECTED";
        this.connectStatus = "已连接";
        this.buttonDisabled.connectDisabled = true;
        this.connectButton = this.$t('connect_status');
        // 获取账户信息按键
        this.buttonDisabled.getAccountDisabled = false;
        this.btnStatus.b1disable = false;
      } else {
        this.connectType = "CONNECT";
        this.connectStatus = "未连接";
        this.buttonDisabled.connectDisabled = false;
        this.connectButton = this.$t('connect_no');
      }
    },
    // 监听事件绑定
    handleMethodsBind() {
      // 监听chainId改变
      ethereum.on("chainChanged", chainId => {
        window.location.reload;
      });

      ethereum.on("connect", connectInfo => {
        console.info("connect+++", connectInfo);
      });
      ethereum.on("disconnect", error => {
        console.error("disconnect+++", error);
      });
    },
    // 获取账户总金额
    async getAmountTotal() {
      this.ethRequest("eth_getBlockByNumber", ["0xaecdde", true]).then(
        result => {
          console.log(result);
        }
      );

      let amount = await this.ethRequest("eth_getBalance", [
        this.accountResults[0],
        "latest"
      ]);
      // 0x1122b6a0e00dce0563082b6e2953f3a943855c1f   cenz
      // 0x97af10D3fc7C70F67711Bf715d8397C6Da79C1Ab   dip
      let param_from = this.accountResults[0];
      let param_data =
        "0x70a08231000000000000000000000000" + param_from.slice(2);
      let amount1 = await this.ethRequest("eth_call", [
        {
          from: param_from,
          to: "0x97af10D3fc7C70F67711Bf715d8397C6Da79C1Ab",
          data: param_data
        },
        "latest"
      ]);
      // console.log(amount)
      // console.log(amount1)
      // 返回的amount单位是Wei，1Ether = 10^18Wei
      if (amount)
        this.amount = (parseInt(amount) / Math.pow(10, 18)).toFixed(4);
      if (amount1) {
        this.amount1 = (amount1 / Math.pow(10, 12)).toFixed(12);
        this.amount_imput = this.amount1;
      }

      // console.log(this.amount)
      // console.log(this.amount1)
    },
    async getNetworkAndChainId() {
      try {
        const chainId = await this.ethRequest("eth_chainId");
        console.log(chainId);
        // handleNewChain(chainId);

        const networkId = await this.ethRequest("net_version");
        console.log(networkId);
        // handleNewNetwork(networkId);
      } catch (err) {
        console.error(err);
      }
    },
    // 连接按键点击
    connectClick() {
      if (this.connectType == "NOINSTALL") {
        this.connectInstall();
      } else {
        this.connectConnect();
      }
    },
    // 安装
    connectInstall() {
      this.connectButton = "Onboarding in progress";
      this.buttonDisabled.connectDisabled = true;
      //On this object we have startOnboarding which will start the onboarding process for our end user
      this.onboarding.startOnboarding();
    },
    // 连接，成功的话，返回账户地址列表
    async connectConnect() {
      try {
        //Will Start the MetaMask Extension
        let accounts = await this.ethRequest("eth_requestAccounts");
        console.log(accounts);
        // 保存账户
        this.handleNewAccounts(accounts);
        // 更新按键状态
        this.updateButtons();
        // 获取账户总金额
        this.getAmountTotal();
      } catch (error) {
        console.error(error);
      }
    },
    // 保存账户地址
    handleNewAccounts(accounts) {
      this.accountResults = accounts[0] ? accounts : []; // "Not able to get accounts"
    },
    // 判断是否连接
    isMetaMaskConnected() {
      // const { ethereum } = window;
      // return Boolean(ethereum && ethereum.isConnected());
      return this.accountResults && this.accountResults.length > 0;
    },
    // 判断是否安装
    isMetaMaskInstalled() {
      const { ethereum } = window;
      return Boolean(ethereum && ethereum.isMetaMask);
    },
    // api调用和错误处理
    ethRequest(method, params = {}) {
      console.info("do job");
      console.log(params);
      return ethereum
        .request({
          method,
          params
        })
        .then(result => {
          return result;
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 发送交易 approve
    toApprove() {
      let approve = "0x095ea7b3000000000000000000000000";
      let lockToken = "0xa44ce259000000000000000000000000";
      let approve_data = "0x095ea7b3";
      let amount = this.amount_imput;
      let c_amount = (amount * Math.pow(10, 12)).toString(16);
      let size = 64;
      c_amount = (Array(size).join("0") + c_amount).slice(-size);
      let address = (
        Array(size).join("0") + "D14f2f1e32e2Dd4C17DFA27f1393815674e2adA2"
      ).slice(-size);
      let req_data = approve_data + address + c_amount;
      console.log(approve_data);
      console.log(this.accountResults[0]);
      console.log(c_amount);
      console.log(req_data);

      this.ethRequest("eth_sendTransaction", [
        {
          from: this.accountResults[0],
          to: "0x97af10D3fc7C70F67711Bf715d8397C6Da79C1Ab",
          gas: "0x0",
          value: "0x0",
          gasPrice: "0x0",
          data: req_data
        }
      ]).then(txHash => {
        console.log(txHash);
        this.btnStatus.b1disable = true;
        this.btnStatus.b2disable = false;
      });
    },

    // 映射
    toMapping() {
      let size = 64;
      let amount = this.amount_imput;
      if (this.mapAddress == "") {
        alert("请确保主网映射地址正确");
        return;
      }

      let c_amount = (amount * Math.pow(10, 12)).toString(16);
      c_amount = (Array(size).join("0") + c_amount).slice(-size);
      var strArray = this.mapAddress.split("");
      var add_str = "";
      console.info(strArray);
      for (let index in strArray) {
        let code = strArray[index].charCodeAt().toString(16);
        // console.info(code)
        add_str += code;
      }

      console.info();
      let c_address = add_str + Array(129 - strArray.length * 2).join("0");
      let dip_main =
        "000000000000000000000000000000000000000000000000000000000000002a";
      let dip_lock_function =
        "0xa44ce2590000000000000000000000000000000000000000000000000000000000000040";
      console.info(c_address);
      console.info(c_amount);
      let dip_data = dip_lock_function + c_amount + dip_main + c_address;
      console.info(dip_data);
      this.ethRequest("eth_sendTransaction", [
        {
          from: this.accountResults[0],
          to: "0xD14f2f1e32e2Dd4C17DFA27f1393815674e2adA2",
          gas: "0x0",
          value: "0x0",
          gasPrice: "0x0",
          data: dip_data
        }
      ]).then(txHash => {
         
          this.btnStatus.b2disable = true;
        console.log(txHash);
      });
    },
    getAccounts() {
      //we use eth_accounts because it returns a list of addresses owned by us.
      return ethereum.request({ method: "eth_accounts" }).then(accounts => {
        this.handleNewAccounts(accounts);
      });
    },
    changeLanguage(e) {
      this.$i18n.locale = e;
      localStorage.setItem("lang", e);
      this.SETLANG(e);
    }
  }
};
</script>

<style lang="less" scoped>
.home {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  .box-card {
    width: 600px;
    .card-button {
      width: 100%;
    }
    .clearfix {
      position: relative;
      width: 100%;
      .language {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(0, -50%)
      }
    }
  }
}
</style>