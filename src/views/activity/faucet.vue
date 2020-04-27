<template>
	<div class="faucet-component">
		<div class="faucet">
			<ValidationObserver v-slot="{ invalid }" ref="form">
				<van-cell-group title="领取测试币" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="did">
						<van-field v-model="faucetForm.did" :error-message="errors[0]" placeholder="请输入您的DID" />
					</ValidationProvider>
				</van-cell-group>
				<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid" @click="handleSubmit">确认领取</van-button>
			</ValidationObserver>
		</div>
	</div>
</template>
<script>
	import { ValidationObserver, ValidationProvider } from 'vee-validate'
	export default {
		name: 'faucet',
		data() {
			return {
				faucetForm: {
					did: ''
				}
			}
		},
		components: {
			ValidationProvider,
			ValidationObserver
		},
		mounted() {
			this.$store.commit('hideLoading')
			this.sockets.subscribe('balance_change', payload => {
				console.log(payload, 'received')
				this.$store.commit('hideLoading')
				this.$toast('领取成功')
			})
		},
		methods: {
			async handleSubmit() {
				this.$store.commit('showLoading')
				const data = {
					dest: this.faucetForm.did,
					num: 50
				}
				this.$socket.emit('test_transfer', data)
				// reset
				this.faucetForm.did = ''
				this.$refs.form.reset()
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.faucet-component {
		.van-panel {
			margin-top: $largeGutter;
		}
	}
</style>
