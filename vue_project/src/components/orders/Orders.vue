<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append"
                       icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单数据表格区域 -->
      <el-table :data="orderListData"
                style="width: 100%"
                border
                stripe>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="order_number"
                         label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price"
                         label="订单价格">
        </el-table-column>
        <el-table-column prop="pay_status"
                         label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success"
                    v-if="scope.row.pay_status ==='1'">已付款</el-tag>
            <el-tag type="danger"
                    v-else>未支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send"
                         label="是否发货">
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{}">
            <el-tooltip effect="dark"
                        content="修改地址"
                        placement="top"
                        :enterable="false">
              <el-button type="primary"
                         icon="el-icon-edit"
                         size="mini"
                         @click="showEditAdressDialog"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark"
                        content="查询物流"
                        placement="top"
                        :enterable="false">
              <el-button type="success"
                         icon="el-icon-location"
                         size="mini"
                         @click="showProgressDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
    <!-- 打开修改地址对话框 -->
    <el-dialog title="修改地址"
               :visible.sync="editAdressDialogVisible"
               width="50%"
               @close="closeAdressDialog">
      <el-form ref="editAdressFormRef"
               :model="editAdressFormData"
               label-width="100px"
               :rules="editAdressFormRules">
        <el-form-item label="省市区/县"
                      prop="adress1">
          <el-cascader v-model="editAdressFormData.adress1"
                       :options="cityData"
                       :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址"
                      prop="adress2">
          <el-input v-model="editAdressFormData.adress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editAdressDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editAdressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 打开物流进度的对话框 -->
    <el-dialog title="物流信息"
               :visible.sync="progressDialogVisible"
               width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressData"
                          :key="index"
                          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {

  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单数据
      orderListData: [],
      // 修改地址对话框
      editAdressDialogVisible: false,
      // 修改地址表单数据
      editAdressFormData: {
        adress1: [],
        adress2: ''
      },
      // 城市数据
      cityData,
      // 修改城市数据表单规则
      editAdressFormRules: {
        adress1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        adress2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      progressDialogVisible: false,
      progressData: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取订单数据失败')
      this.total = res.data.total
      this.orderListData = res.data.goods
    },
    // 页码显示条数变化时候触发
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getOrderList()
    },
    // 当前页码变化时候触发
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getOrderList()
    },
    // 打开修改地址对话框
    showEditAdressDialog () {
      this.editAdressDialogVisible = true
    },
    // 关闭对话框时候重置表单
    closeAdressDialog () {
      this.$refs.editAdressFormRef.resetFields()
    },
    showProgressDialog () {
      const res = {
        data: [{
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        }, {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        }, {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        }, {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        }, {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        }, {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        }, {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        }, {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        }, {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        }, {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }],
        meta: {
          status: 200,
          message: '获取物流信息成功！'
        }
      }
      this.progressData = res.data
      console.log(this.progressData)
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../plugins/timeline/timeline.css";
@import "../../plugins/timeline-item/timeline-item.css";
</style>
