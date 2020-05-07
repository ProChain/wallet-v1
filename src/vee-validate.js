import { localize } from 'vee-validate'
import { required, min_value, max } from 'vee-validate/dist/rules'
import { extend } from 'vee-validate'
import zh_CN from 'vee-validate/dist/locale/zh_CN.json'

localize({
	zh_CN
})

localize('zh_CN')

extend('required', {
	...required,
	message: '请输入{_field_}'
})

extend('max', {
	...max,
	message: '{_field_}不能超过5位',
})

extend('min_value', {
	...min_value,
	validate(value, args) {
		return value >= Number(args.number)
	},
	message: '最少{number}个PRM',
	params: ['number']
});

extend('qrcode', value => {
	if (value.length > 0) {
		return true
	}
	return '{_field_}是必须的'
})
