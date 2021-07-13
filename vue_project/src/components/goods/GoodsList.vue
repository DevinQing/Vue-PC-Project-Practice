<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部 添加和搜索 -->
      <el-row :gutter="20">
        <!-- 搜索商品区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    class="input-with-select"
                    clearable
                    @clear="getGoodsList">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="searchGoodsData"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品区域 -->
        <el-col :span="4">
          <el-button type="primary"
                     @click="goAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsListData"
                border
                stripe
                style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name"
                         label="商品名称">
        </el-table-column>
        <el-table-column prop="goods_price"
                         label="商品价格(元)"
                         width="120px">
        </el-table-column>
        <el-table-column prop="goods_weight"
                         label="商品重量"
                         width="120px">
        </el-table-column>
        <el-table-column label="创建时间"
                         width="150px">
          <!-- 采用一个时间过滤组件 -->
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="300px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditGoodsDialog(scope.row.goods_id)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeGoodsById(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="this.queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="this.queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="this.total">
      </el-pagination>
    </el-card>

    <!-- 编辑商品对话框 -->
    <el-dialog title="编辑商品"
               :visible.sync="editGoodsDialogVisible"
               width="50%">
      <el-form ref="editFormRef"
               :model="editFormData"
               label-width="100px"
               :rules="editFormRules">
        <el-form-item label="商品名称"
                      prop="goods_name">
          <el-input v-model="editFormData.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格"
                      prop="goods_price">
          <el-input v-model="editFormData.goods_price"
                    type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量"
                      prop="goods_number">
          <el-input v-model="editFormData.goods_number"
                    type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量"
                      prop="goods_weight">
          <el-input v-model="editFormData.goods_weight"
                    type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取商品数据需要传递的的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 当前页面的商品数据
      goodsListData: [],
      // 总的商品数据
      total: 0,
      // 显示编辑商品对话框
      editGoodsDialogVisible: false,
      // 编辑商品表单数据
      editFormData: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0
      },
      // 编辑商品表单规则
      editFormRules: {
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
        ]
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('商品数据获取失败')
      this.goodsListData = res.data.goods
      this.total = res.data.total
    },
    // 当前显示页条数变化时
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    // 当前页数变化时
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 通过搜索查看商品列表
    searchGoodsData () {
      this.getGoodsList()
    },
    // 根据id 删除商品
    async removeGoodsById (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') return this.$message.info('你已经取消了删除')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('商品删除失败！')
      this.$message.success('商品删除成功！')
      this.getGoodsList()
    },
    // 跳转到 添加商品页面
    goAddGoodsPage () {
      this.$router.push('goods/add')
    },
    // 打开编辑商品对话
    async showEditGoodsDialog (id) {
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('商品数据获取失败')
      this.editFormData = {
        goods_name: res.data.goods_name,
        goods_price: res.data.goods_price,
        goods_number: res.data.goods_number,
        goods_weight: res.data.goods_weight,
        goods_id: res.data.goods_id
      }
      this.editGoodsDialogVisible = true
    },
    editGoods () {
      console.log(this.editFormData.goods_id)
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请按规则填写数据')
        const { data: res } = await this.$http.put(`goods/${this.editFormData.goods_id}`, {
          goods_name: this.editFormData.goods_name,
          goods_price: this.editFormData.goods_price,
          goods_number: this.editFormData.goods_number,
          goods_weight: this.editFormData.goods_weight,
          goods_cat: '1,3,6'
        })
        if (res.meta.status !== 200) return this.$message.error('商品编辑失败')
        this.$message.success('商品编辑成功')
        this.editGoodsDialogVisible = false
        this.getGoodsList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.input-with-select .el-input-group__prepend {
    background-color: #fff;
}
</style>
