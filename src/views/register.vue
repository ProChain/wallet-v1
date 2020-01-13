<template>
	<div class="register-component">
		<div class="register">
			<ValidationObserver v-slot="{ invalid }">
				<van-cell-group title="类型" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="type">
						<van-field v-model="registerForm.type" readonly clickable :error-message="errors[0]" placeholder="请选择DID类型"
						 @focus="showPicker = true" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="公钥" :border="false">
					<ValidationProvider v-slot="{ errors }" name="pubkey">
						<van-field v-model="registerForm.pubkey" :error-message="errors[0]" placeholder="请输入您的公钥" />
					</ValidationProvider>
				</van-cell-group>
				<!-- <van-cell-group title="上级" :border="false">
			<ValidationProvider v-slot="{ errors }" name="pubkeysuperior">
			  <van-field v-model="registerForm.pubkeysuperior"
			  :error-message="errors[0]"
			  placeholder="请输入您的上级" />
			</ValidationProvider>
		  </van-cell-group> -->
				<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid" @click="handleSubmit">确认生成</van-button>
			</ValidationObserver>
		</div>
		<van-popup v-model="showPicker" position="bottom">
			<van-picker show-toolbar :columns="columns" @cancel="showPicker = false" @confirm="onConfirm" />
		</van-popup>
		<van-panel v-if="did" title="您的DID" status="成功" :desc="did" />
	</div>
</template>
<script>
	import { mapActions } from 'vuex'
	import { DISPATCH_SIGN } from '@/vuex/constants'
	import { ValidationObserver, ValidationProvider } from 'vee-validate'
	import { DID_TYPE } from '@/util/chain'
	import { encodeAddress } from '@polkadot/util-crypto'
	import { stringToHex } from '@polkadot/util'
	import { didToHex, hexToDid } from '@/util/common'
	export default {
		name: 'register',
		data() {
			const columns = Object.values(DID_TYPE)
			return {
				registerForm: {
					type: '交易所',
					superior: '',
					pubkey: ''
				},
				did: '',
				showPicker: false,
				columns
			}
		},
		components: {
			ValidationProvider,
			ValidationObserver
		},
		mounted() {
			this.$store.commit('hideLoading')
			this.sockets.subscribe('Created', payload => {
				const [didHash] = JSON.parse(payload.msg)
				this.did = hexToDid(didHash)
			})
		},
		methods: {
			async handleSubmit() {
				// pubkey to address
				const address = encodeAddress(this.registerForm.pubkey)
				const superior = this.registerForm.superior && didToHex(this.registerForm.superior)
				const didType = Object.keys(DID_TYPE).find(k => DID_TYPE[k] === this.registerForm.type)

				const data = {
					address: '5CMDp8RSys5uBwct5XKY1rBtJtisTPuqZkxcbnho3jxWQJ51',
					method: 'create',
					params: [this.registerForm.pubkey, address, stringToHex(didType), superior, null, null]
				}

				console.log(didType, '-----didType------')
				this[DISPATCH_SIGN](data)
			},
			onConfirm(value) {
				this.registerForm.type = value
				this.showPicker = false
			},
			...mapActions([
				DISPATCH_SIGN
			])
		}
	}
</script>
<style lang="scss">
	@import '../assets/css/variables.scss';

	.register-component {
		.van-panel {
			margin-top: $largeGutter;
		}
	}
</style>
