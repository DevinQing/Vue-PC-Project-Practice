<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警示区域 -->
      <el-alert title="添加商品信息"
                type="info"
                center
                show-icon
                :closable="false">
      </el-alert>
      <!-- 步骤图区域 -->
      <el-steps :space="200"
                :active="activeIndex - 0"
                finish-status="success"
                align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 将表单嵌套在外侧 -->
      <el-form :model="addFormData"
               :rules="AddFormRules"
               ref="AddFormRef"
               label-width="100px"
               :label-position="'top'">
        <!-- 左侧标签栏区域 -->
        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="tabLeave"
                 @tab-click="tabChange">
          <!--  基本信息面板 -->
          <el-tab-pane label="基本信息"
                       name="0">
            <el-form-item label="商品名称"
                          prop="goods_name">
              <el-input v-model="addFormData.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格"
                          prop="goods_price">
              <el-input v-model="addFormData.goods_price"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量"
                          prop="goods_weight">
              <el-input v-model="addFormData.goods_weight"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量"
                          prop="goods_number">
              <el-input v-model="addFormData.goods_number"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类"
                          prop="goods_cate">
              <el-cascader v-model="addFormData.goods_cate"
                           :options="catelist"
                           :props="cateProps"
                           @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数面板 -->
          <el-tab-pane label="商品参数"
                       name="1">
            <el-form-item :label="item.attr_name"
                          v-for="item in manyTabData"
                          :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals"
                                 @change="manyChange">
                <el-checkbox :label="cb"
                             v-for="(cb,i) in item.attr_vals"
                             :key="i"
                             border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性面板 -->
          <el-tab-pane label="商品属性"
                       name="2">
            <el-form-item v-for="item in this.onlyTabData"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片上传面板 -->
          <el-tab-pane label="商品图片"
                       name="3">
            <el-upload :action="this.uploadUrl"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       list-type="picture"
                       :headers="this.headersObj"
                       :on-success="handleSuccess">
              <el-button size="small"
                         type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容"
                       name="4">
            <quill-editor ref="myQuillEditor"
                          v-model="addFormData.goods_introduce" />
            <el-button type="primary"
                       style="margin-top:15px"
                       @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="图片预览"
               :visible.sync="picViewDialogVisible"
               width="50%">
      <img :src="this.picViewPath"
           style="width: 100%">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 步骤图激活的 索引
      activeIndex: '0',
      // 添加商品表单数据
      addFormData: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单规则
      AddFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cate: [
          { required: true, message: '请选择商品类型', trigger: 'blur' }
        ]
      },
      // 商品分类数据
      catelist: [],
      // 商品分类的 props
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品参数数据
      manyTabData: [],
      // 商品属性数据
      onlyTabData: [],
      // 图片上传 url 地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 自己设置上传图片的请求体
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的路径
      picViewPath: '',
      // 图片对话框的显示
      picViewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获得表单分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器 变化时候
    handleChange () {
      if (this.addFormData.goods_cate.length !== 3) {
        this.addFormData.goods_cate = []
      }
      console.log(this.addFormData.goods_cate)
    },
    // tab 栏标签离开当前标签的时候
    tabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addFormData.goods_cate.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab 栏 点击导航时候触发
    async tabChange () {
      console.log(this.activeIndex)
      // 动态参数页面
      if (this.activeIndex === '1') {
        // console.log(this.cateId)
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) return this.$message.error('商品参数获取失败！')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabData = res.data
        console.log(this.manyTabData)
      }
      // 静态属性页面
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) return this.$message.error('商品属性获取失败！')
        this.onlyTabData = res.data
        console.log(this.onlyTabData)
      }
    },
    // 浏览上传图片时候触发
    handlePreview (val) {
      this.picViewPath = val.response.data.url
      console.log(this.picViewPath)
      this.picViewDialogVisible = true
    },
    // 删除上传图片时候触发
    handleRemove (val) {
      // 逻辑 找到图片的索引 然后将该索引的图片从表单图片的数组中移除
      // this.addFormData.pics.findIndex(x)
      const tempPath = val.response.data.tmp_path
      const i = this.addFormData.pics.findIndex(item => {
        return item.pic === tempPath
      })
      this.addFormData.pics.splice(i, 1)
    },
    // 图片上传成功后的处理事件
    handleSuccess (val) {
      console.log(val)
      // 获取当前成功的图片的信息
      const picInfo = {
        pic: val.data.tmp_path
      }
      this.addFormData.pics.push(picInfo)
      console.log(this.addFormData)
    },
    // 添加商品
    addGoods () {
      // 先实现表单的预验证
      this.$refs.AddFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 处理attr 数据
        // 动态参数
        this.manyTabData.forEach(item => {
          const manyInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addFormData.attrs.push(manyInfo)
        })
        // 静态参数
        this.onlyTabData.forEach(item => {
          const onlyInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addFormData.attrs.push(onlyInfo)
        })
        // console.log(this.addFormData)
        // 提交要求的 goods_cat 是一个 以 ， 分隔的字符串
        // 但是表单数据中是一个数组，这个数组和 级联选择器双向绑定
        // 级联选择器规定这个数据只能用数组
        // 所以我们需要深拷贝一份数据 再处理数据来提交
        const formData = _.cloneDeep(this.addFormData)
        formData.goods_cat = formData.goods_cate.join(',')
        // console.log(formData)
        const { data: res } = await this.$http.post('goods', formData)
        if (res.meta.status !== 201) return this.$message.error('商品添加失败！')
        this.$message.success('商品添加成功！')
        this.$router.push('/goods')
        console.log(res)
      })
    },
    // many 变化时候
    manyChange () {
      console.log(this.manyTabData)
    }
  },
  computed: {
    // 商品分类 id
    cateId () {
      if (this.addFormData.goods_cate.length === 3) {
        return this.addFormData.goods_cate[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 0 5px 0 0 !important;
}
</style>
