<template>
	<div class="profile">
		<div class="account">
			<van-cell-group title="我的DID" :border="false">
				<van-cell v-if="walletInfo.did" :title="walletInfo.did | clip(18, -10)" label="创建区块身份头像" is-link
				:center="true"
				:to="{ path: '/avatar', query: { avatar } }">
					<i class="icon pra" slot="icon"></i>
				</van-cell>
				<van-cell v-else title="未绑定" :center="true">
					<i class="icon pra grey" slot="icon"></i>
				</van-cell>
			</van-cell-group>
			<van-cell-group title="社交账号" :border="false">
				<van-cell title="微信账号" :center="true" :value="walletInfo.did ? '已绑定' : '未绑定'">
					<i class="icon wechat" :class="{ 'grey': !walletInfo.did }" slot="icon"></i>
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
</template>
<script>
import { mapState } from 'vuex'
export default {
	name: 'profile',
	computed: {
		externalAddress() {
			return this.walletInfo.external_address
		},
		...mapState([
			'walletInfo',
			'avatar'
		])
	}
}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';
	.profile {
		.van-cell-group {
			.van-cell {}

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
</style>
