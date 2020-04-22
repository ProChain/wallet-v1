<template>
	<div class="profile">
		<div class="account">
			<van-cell-group title="我的DID" :border="false">
				<van-cell v-if="walletInfo.did" :title="walletInfo.did | clip(18, -10)" label="创建区块身份头像" is-link :center="true" to="/avatar">
					<i class="icon prm" slot="icon"></i>
				</van-cell>
				<van-cell v-else title="未绑定" :center="true">
					<i class="icon prm grey" slot="icon"></i>
				</van-cell>
			</van-cell-group>
			<van-cell-group title="社交账号" :border="false">
				<van-cell title="微信账号" :center="true" :value="walletInfo.did ? '已绑定' : '未绑定'">
					<i class="icon wechat" :class="{ 'grey': !walletInfo.did }" slot="icon"></i>
				</van-cell>
			</van-cell-group>
			<van-cell-group title="资产账号" :border="false" class="external-account">
				<van-cell title="BTC收款账号" :center="true" :label="externalAddress.btc || '未绑定'" is-link :to="{path: '/update', query: {btc: 1}}">
					<i class="icon btc" :class="{ 'grey': !externalAddress.btc }" slot="icon"></i>
				</van-cell>
				<van-cell title="ETH收款账号" :center="true" :label="`${externalAddress.eth}` || '未绑定'" is-link :to="{path: '/update', query: {eth: 1}}">
					<i class="icon eth" :class="{ 'grey': !externalAddress.eth }" slot="icon"></i>
				</van-cell>
				<van-cell title="EOS收款账号" :center="true" :label="externalAddress.eos || '未绑定'" is-link :to="{path: '/update', query: {eos: 1}}">
					<i class="icon eos" :class="{ 'grey': !externalAddress.eos }" slot="icon"></i>
				</van-cell>
			</van-cell-group>
		</div>
		<van-overlay :show="isNewbie">
			<div class="wrapper">
				<van-cell v-if="walletInfo.did" :title="walletInfo.did | clip(18, -10)" label="创建区块身份头像" is-link :center="true" :to="{path: '/avatar', query: {avatar}}">
					<i class="icon prm" slot="icon"></i>
				</van-cell>
				<van-cell v-else title="未绑定" :center="true">
					<i class="icon prm grey" slot="icon"></i>
				</van-cell>
				<van-icon name="share" />
				<div class="tip">
					点击创建区块链身份头像
				</div>
			</div>
		</van-overlay>
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
				'isNewbie'
			])
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.profile {
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
		.van-overlay {
			.wrapper {
				align-items: flex-start;
				justify-content: flex-start;
				align-content: flex-start;
				flex-wrap: wrap;
				margin-top: 39PX;
				.van-cell--center {
					flex: 0 0 100%;
				}
				.van-icon-share {
					color: #fff;
					transform: rotate(-90deg);
					margin: $largeGutter auto 0;
				}
				.tip {
					flex: 0 0 100%;
					color: #fff;
					text-align: center;
					font-size: $mediumFontSize;
					padding: $largeGutter 0;
				}
			}
		}
	}
</style>
