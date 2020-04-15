<template>
	<div class="unlock-component">
		<div class="unlock-card">
			<ValidationObserver v-slot="{ invalid }" ref="form">
				<van-cell-group title="赎回PRM" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="amount">
						<van-field type="number" v-model="amount" :error-message="errors[0]" placeholder="请输入赎回数量" />
						<van-cell title="钱包余额" :value="walletInfo.free_balance | money" />
					</ValidationProvider>
				</van-cell-group>
				<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid" @click="handleSubmit">确认赎回</van-button>
			</ValidationObserver>
			<div class="desc">
				<h2>抵押状态</h2>
				<p>
					已抵押<b>{{ lockedRecords.locked_funds | money }}</b>，团队规模
					<b>{{ lockedRecords.max_quota | person }}</b>，分成率
					<b>{{ lockedRecords.rewards_ratio || 0 }}%</b>
				</p>
				<h2>为什么要赎回？</h2>
				<p>
					如果您的团队成员不活跃，可以考虑减少抵押的PRM
				</p>
				<h2>赎回规则</h2>
				<p>
					1.每次赎回冻结时间为7天，7天后赎回的PRM会进入钱包<br>
					2.如果继续追加抵押，冻结时间按照最新一次抵押计算
				</p>
			</div>
		</div>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { DISPATCH_SIGN } from '@/vuex/constants'
	import { formatNumber } from '@/util/common'
	import { ValidationObserver, ValidationProvider } from 'vee-validate'
	export default {
		name: 'walletRedemption',
		data() {
			return {
				amount: null
			};
		},
		computed: {
			...mapState([
				'walletInfo'
			]),
			lockedRecords() {
				return this.walletInfo.locked_records || {};
			}
		},
		components: {
			ValidationProvider,
			ValidationObserver
		},
		methods: {
			async handleSubmit() {

				const amount = formatNumber(this.amount)
				const data = {
					address: this.walletInfo.address,
					method: 'unlock',
					params: [amount]
				}

				this[DISPATCH_SIGN](data)
				this.amount = null
				this.$refs.form.reset()
			},
			...mapActions([
				DISPATCH_SIGN
			])
		}
	};
</script>

<style lang="scss">
	@import '../../assets/css/variables.scss';

	.unlock-card {
		font-size: $baseFontSize;

		.desc {
			line-height: $baseLineHeight;
			margin-top: $largeGutter;
			padding: $mediumGutter;

			p {
				margin-bottom: $largeGutter;
			}
		}
	}
</style>
