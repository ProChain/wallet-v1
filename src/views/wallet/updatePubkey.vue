<template>
	<div class="update-pubkey">
		<ValidationObserver v-slot="{ invalid }" ref="form">
			<van-cell-group title="更换公钥" :border="false">
				<ValidationProvider v-slot="{ errors }" rules="required" name="pubkey">
					<van-field v-model="pubkey" :error-message="errors[0]" placeholder="请输入新的公钥地址" />
				</ValidationProvider>
			</van-cell-group>
			<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid" @click="handleUpdatePubkey">确认更换</van-button>
		</ValidationObserver>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { DISPATCH_SIGN } from '@/vuex/constants'
	import { ValidationObserver, ValidationProvider } from 'vee-validate'
	export default {
		name: 'walletUpdatePubkey',
		data() {
			return {
				pubkey: ''
			}
		},
		components: {
			ValidationProvider,
			ValidationObserver
		},
		computed: {
			...mapState([
				'walletInfo'
			])
		},
		methods: {
			async handleUpdatePubkey() {
				const data = {
					address: this.walletInfo.address,
					method: 'update',
					params: [this.pubkey]
				}
				this[DISPATCH_SIGN](data)
				this.pubkey = ''
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

	.updatedid-modal {
		width: 80%;
		background: #fff;

		button {
			margin-top: 30px;
		}
	}
</style>
