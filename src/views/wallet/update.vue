<template>
<div>
  <div class="did-update-card">
	<ValidationObserver v-slot="{ invalid }">
	  <van-cell-group :title="`绑定${addressType}账号`" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="address">
		  <van-field
		  v-model="address"
		  :error-message="errors[0]"
		  :placeholder="placeholder" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-button type="primary" square
	  class="btn-submit"
	  size="large"
	  :disabled="invalid" @click="handleSubmit">确认更新</van-button>
	</ValidationObserver>
  </div>
</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { SET_WALLET_INFO, DISPATCH_SIGN } from '@/vuex/constants'
import { stringToHex } from '@polkadot/util'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
export default {
	name: 'walletUpdate',
	data() {
		return {
			qrcode: null,
			showDetail: false,
			placeholder: '请输入您的btc地址',
			addressType: 'btc',
			address: ''
		};
	},
	computed: {
		...mapState([
			'walletInfo'
		])
	},
	components: {
		ValidationProvider,
		ValidationObserver
	},
	mounted() {
		const { btc, eth, eos } = this.$route.query;
		if (btc) {
			this.addressType = 'btc';
			this.placeholder = '请输入您的btc地址';
		} else if (eth) {
			this.addressType = 'eth';
			this.placeholder = '请输入您的eth地址';
		} else if (eos) {
			this.addressType = 'eos';
			this.placeholder = '请输入您的eos地址';
		} else {
			console.log('invalid');
		}
	},
	methods: {
		handleSubmit() {
			let address = stringToHex(this.address)
			let addressType = this.addressType
			if (addressType === 'eth') {
				address = stringToHex(this.address.toLowerCase().replace('0x', ''))
			}

			const data = {
				address: this.walletInfo.address,
				method: 'addExternalAddress',
				params: [stringToHex(addressType), address]
			}
			this[DISPATCH_SIGN](data)
		},
		...mapActions([
			SET_WALLET_INFO,
			DISPATCH_SIGN
		])
	}
};
</script>
