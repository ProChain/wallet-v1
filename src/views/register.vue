<template>
<div class="team-update-component">
  <div class="team-update">
	<ValidationObserver v-slot="{ invalid }">
	  <van-cell-group title="类型" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="type">
			<van-field
			v-model="registerForm.type"
			readonly
			clickable
			:error-message="errors[0]"
			placeholder="请选择DID类型"
			@focus="showPicker = true"/>
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="公钥" :border="false">
	  		<ValidationProvider v-slot="{ errors }" name="pubkey">
	  		  <van-field v-model="registerForm.pubkey"
	  		  :error-message="errors[0]"
	  		  placeholder="请输入您的公钥" />
	  		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="上级" :border="false">
		<ValidationProvider v-slot="{ errors }" name="pubkeysuperior">
		  <van-field v-model="registerForm.pubkeysuperior"
		  :error-message="errors[0]"
		  placeholder="请输入您的上级" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-button type="primary" square
	  class="btn-submit"
	  size="large"
	  :disabled="invalid" @click="handleSubmit">确认生成</van-button>
	</ValidationObserver>
  </div>
  <van-popup v-model="showPicker" position="bottom">
    <van-picker
      show-toolbar
      :columns="columns"
      @cancel="showPicker = false"
      @confirm="onConfirm"
    />
  </van-popup>
</div>
</template>
<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { encodeAddress } from '@polkadot/util-crypto'
import { u8aToU8a, stringToHex } from '@polkadot/util'
import { didToHex } from '@/util/common'
export default {
	name: 'register',
	data() {
		return {
			registerForm: {
				type: '个人',
				superior: '',
				pubkey: ''
			},
			showPicker: false,
			columns: ['个人', '交易所', '设备', '应用', '合约', '节点']
		}
	},
	components: {
		ValidationProvider,
		ValidationObserver
	},
	methods: {
		async handleSubmit() {
			// pubkey to address
			const address = encodeAddress(this.registerForm.pubkey)
			const superior = didToHex(this.registerForm.superior)
			const didType = stringToHex('1')
			console.log(address, 'address----')

			const data = JSON.stringify({
				address: this.walletInfo.address,
				method: 'create',
				params: [this.registerForm.pubkey, address, didType, superior, u8aToU8a([]), u8aToU8a([])]
			});

			this.$socket.emit('sign', data)
			this.$store.commit('showLoading')
		},
		onConfirm(value) {
			this.registerForm.type = value
			this.showPicker = false
		}
	}
};
</script>
