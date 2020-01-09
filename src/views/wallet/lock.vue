<template>
<div class="lock-component">
  <div class="lock-card">
	<ValidationObserver v-slot="{ invalid }" ref="form">
	  <van-cell-group title="抵押PRA" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required|min_value:10" name="amount">
		  <van-field
		  type="number"
		  v-model="lockForm.amount"
		  :error-message="errors[0]"
		  placeholder="请输入抵押数量" />
		  <van-cell title="钱包余额" :value="walletInfo.free_balance | money" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-button type="primary" square
	  class="btn-submit"
	  size="large"
	  :disabled="invalid" @click="handleSubmit">确认抵押</van-button>
	</ValidationObserver>
	<div class="desc">
	  <h2>抵押状态</h2>
	  <p>
		已抵押<b>{{ lockedRecords.locked_funds | money }}</b>，团队规模
		<b>{{ lockedRecords.max_quota | person }}</b>，分成率
		<b>{{ lockedRecords.rewards_ratio || 0 }}%</b>
	  </p>
	  <h2>为什么要抵押？</h2>
	  <p>
		当前，每抵押0.1个PRA，即可扩大1人团队规模。<br>
		团队成员与团队负责人的关系将永久绑定并记录上链，团队成员的每笔广告收益，团队负责人会获得10%分成。减少抵押则降低分成比例。<br>
		当团队成员开创新团队时，其团队负责人将获得其首次抵押费用的50%
	  </p>
	  <h2>抵押规则</h2>
	  <p>
		1.每次抵押冻结时间为7天，7天后可自行赎回<br>
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
const intialFormData = {
	amount: '',
	period: '7'
}
export default {
	name: 'walletLock',
	data() {
		return {
			qrcode: null,
			lockLoading: false,
			lockedFunds: 0,
			lockForm: Object.assign({}, intialFormData)
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
			const period = this.lockForm.period * 60 * 60 * 24
			const amount = formatNumber(this.lockForm.amount)
			const data = {
				address: this.walletInfo.address,
				method: 'lock',
				params: [amount, period]
			}

			this[DISPATCH_SIGN](data)
			// reset
			this.lockForm = Object.assign({}, intialFormData)
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
  .lock-card {
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
