<template>
  <div class="app-container">
    <base-searcher :loading="listLoading" @search="getList" @reset="reset">
      <slot name="filters" />
      <template slot="buttons">
        <slot name="buttons" />
      </template>
    </base-searcher>

    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="onSortChange"
      @selection-change="onSelectionChange"
      @row-click="onRowClick"
    >
      <slot />
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="query.page"
      :limit.sync="query.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index'
import BaseSearcher from './searcher' // secondary package based on el-pagination

export default {
  name: 'BaseList',
  components: { BaseSearcher, Pagination },
  props: {
    action: {
      type: Function,
      default: (url, data) => {},
      required: true
    },

    primary: {
      type: String,
      default: 'id'
    },

    columns: {
      type: Array,
      default() {
        return []
      }
    },
    query: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    const baseQuery = { page: 1, limit: 20, sort: '+' + this.primary }
    const tempQuery = this.$utils.deepcopy({ ...baseQuery, ...this.query })
    this.updateQuery(tempQuery)

    return {
      list: [],
      total: 0,
      listLoading: true,
      baseQuery,
      tempQuery,
      selectRow: {},
      selectRowIds: []
    }
  },

  created() {
    this.getList()
  },

  methods: {

    /**
     * 获取列表数据
     */
    getList() {
      this.listLoading = true
      // 首次查询时query属性还没有改变，就没有默认的page和limit值
      this.action({ ...this.baseQuery, ...this.query }).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
        if (this.list && this.list.length > 0 && !this.list[0].hasOwnProperty(this.primary)) {
          throw Error('行对象没有 "' + this.primary + '" 属性')
        }
      }).catch(reason => {
        this.list = []
        this.listLoading = false
      })
    },

    /**
     * 根据数据行
     */
    updateRow(row) {
      const index = this.list.findIndex((item) => item[this.primary] === row[this.primary])
      this.updateRowByIndex(index, row)
    },

    /**
     * 根据索引更新数据行
     */
    updateRowByIndex(index, row) {
      this.list.splice(index, 1, row)
    },

    /**
     * 重置查询参数到默认值
     */
    reset() {
      this.updateQuery(this.tempQuery)
    },

    /**
     * 更新查询参数
     */
    updateQuery(query) {
      this.$emit('update:query', this.$utils.deepcopy(query))
    },

    /**
     * 获取单选对象
     */
    getSelect() {
      return this.selectRow
    },

    /**
     * 获取已选择的单选的id
     */
    getSelectId() {
      return this.selectRow[this.primary]
    },

    /**
     * 获取已选择所有行的id数组
     */
    getSelectIds() {
      return this.selectRowIds
    },

    /**
     * 是否选择单选
     */
    selectOne() {
      if (this.selectRowIds.length !== 1) {
        this.$message.warning('请选择一项')
        return false
      }
      return true
    },

    /**
     * 是否选择多选
     */
    selectMulti() {
      if (this.selectRowIds.length < 1) {
        this.$message.warning('请至少选择一项')
        return false
      }
      return true
    },

    /**
     * 选项发生改变
     *
     * @param selection
     */
    onSelectionChange(selection) {
      const length = selection.length
      if (length === 1) {
        this.selectRow = selection[0]
        this.selectRowIds = [this.selectRow[this.primary]]
      } else {
        this.selectRow = null
        this.selectRowIds = length > 0 ? selection.map((item) => item[this.primary]) : []
      }
    },

    /**
     * 点击单前行高亮同时选择当前行
     *
     * @param row
     */
    onRowClick(row) {
      this.$refs.table.toggleRowSelection(row)
    },

    /**
     * 排序改变
     * @param data
     */
    onSortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.query.sort = '+' + prop
      } else {
        this.query.sort = '-' + prop
      }
      this.query.page = 1
      this.getList()
    }
  }
}
</script>
