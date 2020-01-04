<template>
	<div class="home-page">
	  <div class="wallet">
		  <account :metadata="walletInfo"/>
		  <div class="lock-btns">
			<van-grid :border="false" :column-num="3">
			  <van-grid-item icon="manager-o" text="DID" />
			  <van-grid-item icon="balance-o" text="挖矿" to="/team" />
			  <van-grid-item icon="replay" text="更新" to="/update-pubkey" />
			</van-grid>
		  </div>
		  <div class="account">
			<van-cell-group title="我的DID" :border="false">
			  <van-cell v-if="walletInfo.did" :title="did || '未绑定'" label="创建区块链头像" is-link
			  :center="true"
			  :to="{ path: '/avatar', query: { avatar } }"
			  >
				<i class="icon pra" slot="icon"></i>
			  </van-cell>
			  <van-cell v-else :title="did || '未绑定'" :center="true">
				<i class="icon pra grey" slot="icon"></i>
			  </van-cell>
			</van-cell-group>
			<van-cell-group title="社交账号" :border="false">
			  <van-cell title="微信账号" :center="true" :value="walletInfo.did ? '已绑定' : '未绑定'">
				<i class="icon wechat" :class="{ 'grey': !walletInfo.did }" slot="icon"></i>
			  </van-cell>
			  <van-cell title="推特账号" :center="true" :value="walletInfo.twitter ? '已绑定' : '未绑定'">
				<i class="icon twitter" :class="{ 'grey': !walletInfo.twitter }" slot="icon"></i>
			  </van-cell>
			</van-cell-group>
			<van-cell-group title="资产账号" :border="false" class="external-account">
			  <van-cell title="BTC收款账号" :center="true" :label="externalAddress.btc || '未绑定'" is-link :to="{ path: '/update', query: { btc: 1 } }">
				<i class="icon btc" :class="{ 'grey': !externalAddress.btc }" slot="icon"></i>
			  </van-cell>
			  <van-cell title="ETH收款账号" :center="true" :label="`${externalAddress.eth}` || '未绑定'" is-link :to="{ path: '/update', query: { eth: 1 } }">
				<i class="icon eth" :class="{ 'grey': !externalAddress.eth }" slot="icon"></i>
			  </van-cell>
			  <van-cell title="EOS收款账号" :center="true" :label="externalAddress.eos || '未绑定'" is-link :to="{ path: '/update', query: { eos: 1 } }">
				<i class="icon eos" :class="{ 'grey': !externalAddress.eos }" slot="icon"></i>
			  </van-cell>
			</van-cell-group>
		  </div>
	  </div>
	  <van-overlay :show="showBindingTutorial">
		<div class="wrapper">
		  <div class="binding-tutorial">
			<div class="text">
			  您尚未激活您的PRA账号，请按照下图，在链接所群中发送激活码完成账号激活
			</div>
			<div class="code-con">
			  <img src="@/assets/images/bind-did.jpg" alt="binding">
			  <div class="code-num">
				{{ bindSn }}
			  </div>
			</div>
			<van-button type="primary"
			size="large"
			class="bind-code copy tiny-height"
			:data-clipboard-text="bindSn">
			复制激活码<b>{{ bindSn }}</b>
			</van-button>
		  </div>
		</div>
	  </van-overlay>
	</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { chainBindSn, chainAuth } from '@/util/api'
import { clipAddress, sleep } from '@/util/common'
import ClipboardJS from 'clipboard'
import { convert, getMetadata } from '@/util/chain'
import { SET_WALLET_INFO, SET_TOKEN } from '@/vuex/constants'
import Account from '@/components/wallet/account'

export default {
	name: 'walletHome',
	data() {
		return {
			wallet: {},
			code: '',
			showBindingTutorial: false,
			avatar: '',
			bindSn: '888888',
			updateForm: {
				pubkey: '',
				amount: ''
			},
			rules: {
				pubkey: [
					{
						required: true,
						message: '公钥地址不能为空'
					}
				]
			}
		}
	},
	computed: {
		did() {
			return this.walletInfo.did && clipAddress(this.walletInfo.did, 18, -10)
		},
		externalAddress() {
			return this.walletInfo.external_address
		},
		...mapState([
			'walletInfo'
		])
	},
	components: {
		Account
	},
	async mounted() {
		try {
			this.clipboard = new ClipboardJS('.copy', {
				text(e) {
					return e.getAttribute('data-clipboard-text')
				}
			});
			this.clipboard.on('success', (e) => {
				if (e.action === 'copy') {
					this.$toast('复制成功')
				}
				e.clearSelection()
			});
			this.clipboard.on('error', function(e) {
				console.error('Action:', e.action)
			})
			await sleep(300)
			await this.getUserMetadata()
		} catch (e) {
			console.log(e)
		}
	},
	methods: {
		async getUserMetadata() {
			const url = window.location.href
			const part1 = url.split('&state')[0]
			const code = part1.split('code=')[1]
			const { data } = await chainAuth(code)
			if (data) {
				this.avatar = data.avatar
				const { result: didHash } = await convert(data.wxid, 'wxid')
				if (didHash) {
					const { data: metadata } = await getMetadata(didHash)
					this[SET_WALLET_INFO](metadata)
					this[SET_TOKEN](data.token)
				}
			}
			const { data: snData } = await chainBindSn(code)
			this.bindSn = snData ? snData.result : ''

			if (this.bindSn) this.showBindingTutorial = true
		},
		...mapActions([
			SET_WALLET_INFO,
			SET_TOKEN
		])
	}
}
</script>
<style lang="scss">
  @import '../../assets/css/variables.scss';
  .wallet {
	height: 100%!important;
	.lock-btns {
	  text-align: center;
	}
	.van-cell-group {
	  .van-cell {
	  }
	  .icon {
		width: 38px;
		height: 38px;
		background-repeat: no-repeat;
		background-position: center;
		background-size: 90%;
		margin-right: 10px;
		&.wechat {
		  background-image: url(../../assets/images/wechat.svg);
		}
		&.twitter {
		  background-image: url(../../assets/images/twitter.svg);
		}
		&.pra {
		  background-image: url(../../assets/images/logo.jpg);
		}
		&.eos {
		  background-image: url(../../assets/images/eos.svg);
		}
		&.eth {
		  background-image: url(../../assets/images/eth.svg);
		}
		&.btc {
		  background-image: url(../../assets/images/btc.png);
		}
	  }
	}
	.external-account {
	  margin-bottom: 20px;
	}
	.account {
	  .title {
		position: relative;
		.create {
		  position: absolute;
		  top: -10px;
		  right: 0;
		  z-index: 999;
		  font-size: $mediumFontSize;
		}
	  }
	}
  }
  .binding-tutorial {
	background: #fff;
	width: 80%;
	padding: 10px;
	font-size:  $baseFontSize;
	.code-con {
	  position: relative;
	  img {
		width: 100%;
		margin: 10px 0;
	  }
	  .code-num {
		position: absolute;
		top: 19px;
		right: 70px;
	  }
	}
	.bind-code {
	  font-size: $mediumFontSize;
	  b {
		margin-left: 5px;
	  }
	}
  }
</style>
