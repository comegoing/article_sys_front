<template>
  <div class="main-container">
    <SearchModal
      :searchModalVisable="searchModalVisable"
      @closeSearch="closeSearch"
      @search="realSearch"
    />
    <a-spin :spinning="spinning">
      <a-layout class="layout-wrapper">
        <a-layout-header class="header">
          <div class="logo"><a-icon type="home" /> arXiv论文筛选与管理系统</div>
        </a-layout-header>

        <a-layout class="main-body">
          <a-layout-sider class="left-side" :width="300">
            <!-- 左侧筛选条件内容保持不变 -->
            <div class="select">
              <a-icon type="edit" theme="twoTone" /> 筛选条件
              <a-button
                class="clear"
                type="primary"
                icon="delete"
                @click="clear"
              >
                清除筛选
              </a-button>
            </div>

            <a-row class="opotions">
              <p class="label">时间筛选</p>
              <a-range-picker
                :locale="locale"
                class="date"
                v-model="dateValue"
                @change="dateChange"
              />
            </a-row>

            <a-row class="opotions">
              <p class="label">类别筛选</p>
              <a-radio-group v-model="articleType">
                <a-radio
                  :style="radioStyle"
                  v-for="(item, index) in articleOptions"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-radio>
              </a-radio-group>
            </a-row>
            <a-row class="opotions">
              <p class="label">关键字搜索</p>
              <a-input-search
                v-model="keyWord"
                class="query-search"
                placeholder="请输入关键字条件"
                enter-button
                @search="onSearch"
              />
            </a-row>
            <a-row class="opotions">
              <p class="label">排序方式</p>
              <a-select style="width: 220px">
                <a-select-option
                  v-for="(item, index) in sortOptions"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-row>
          </a-layout-sider>

          <a-layout-content class="content">
            <!-- 内容区域保持不变 -->
            <div class="top-content">
              <a-button
                type="primary"
                icon="search"
                theme="filled"
                @click="openSearch()"
              >
                检索论文
              </a-button>
              <a-button
                type="primary"
                icon="download"
                theme="filled"
                @click="exportArticles"
              >
                导出论文
              </a-button>
            </div>

            <!-- 空状态显示 -->
            <div v-if="papers.length === 0" class="empty-state">
              <a-empty description="暂无论文数据" />
            </div>
            <!-- 全选状态 -->
            <div v-if="papers.length !== 0">
              <div :style="{ borderBottom: '1px solid #E9E9E9' }">
                <a-checkbox
                  @change="selectAll"
                  style="font-weight: bold; font-size: 18px"
                >
                  全选
                </a-checkbox>
              </div>
              <br />
              <!-- 卡片 -->
              <a-row
                class="card-row"
                v-for="(item, index) in selectedPapers"
                :key="index"
                :value="item.url"
              >
                <div style="display: flex">
                  <a-checkbox
                    style="margin-right: 10px"
                    v-model="item.detailChecked"
                  >
                  </a-checkbox>
                  <a-card
                    style="width: 100%"
                    :hoverable="true"
                    @click="showDetails(item, index)"
                  >
                    <!-- 论文标题 -->
                    <div class="paper-title">
                      <p class="title-zh">{{ item.titleZH }}</p>
                    </div>

                    <!-- 作者信息 -->
                    <div class="paper-authors">
                      <p class="authors">
                        <span class="label">作者:</span>
                        {{ item.author }}
                      </p>
                    </div>

                    <!-- 日期信息 -->
                    <div class="paper-meta">
                      <p class="date">
                        <span class="label">发布日期:</span>
                        {{ item.date }}
                      </p>
                    </div>

                    <!-- 中文摘要 -->
                    <div class="paper-abstract">
                      <p class="abstract-label">摘要</p>
                      <p class="abstract-content">{{ item.abstractZH }}</p>
                    </div>

                    <!-- 详细信息（展开时显示） -->
                    <div v-if="item.detailVisible" class="paper-details">
                      <!-- 英文标题 -->
                      <div class="paper-title-en">
                        <p class="title-en">
                          <span class="label">Title:</span>
                          {{ item.titleEN }}
                        </p>
                      </div>

                      <!-- 英文摘要 -->
                      <div class="paper-abstract-en">
                        <p class="abstract-label">Abstract</p>
                        <p class="abstract-content">{{ item.abstractEN }}</p>
                      </div>

                      <!-- 论文链接 -->
                      <div class="paper-url">
                        <p class="url">
                          <span class="label">论文链接:</span>
                          <a
                            :href="item.url"
                            target="_blank"
                            class="url-link"
                            >{{ item.url }}</a
                          >
                        </p>
                      </div>
                    </div>
                  </a-card>
                </div>
              </a-row>
              <a-pagination
                :default-current="1"
                :total="total"
                @change="changePage"
              />
            </div>
          </a-layout-content>
        </a-layout>

        <a-layout-footer class="footer">
          © 2025 arXiv论文筛选与管理系统 | 专为学术研究人员设计
        </a-layout-footer>
      </a-layout>
    </a-spin>
  </div>
</template>

<script>
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { ARTICLE_OPTIONS, SORT_OPTIONS } from "../utils/constant";
import { searchPapers } from "../api/post";
import SearchModal from "./SearchModal.vue";
import { isEmpty, isNaturalNumber, openMessage } from "../utils/common";
import moment from "moment";
export default {
  components: { SearchModal },
  computed: {
    // 论文总数量-用于分页器
    total() {
      return this.papers.length;
    },
    // 被选择的论文-用于实际展示
    selectedPapers() {
      console.log("我被触发了");
      const startIndex = (this.currentPage - 1) * 10;
      const endIndex = startIndex + 10;

      return this.papers.slice(startIndex, endIndex);
    },
  },
  data() {
    return {
      // ===== 样式 =====
      locale, // 中文样式
      radioStyle: {
        display: "block",
        height: "30px",
        lineHeight: "30px",
        fontSize: "18px",
      }, // 单选样式

      // ======== 筛选条件 =========
      keyWord: "", // 关键词
      articleType: null, // 论文类型
      articleOptions: [], // 筛选类别选择
      sortOptions: [], // 排序方式选择
      datesList: [], // 日期
      dateValue: null,

      // ===== 显示状态 =====
      spinning: false, // 加载状态
      searchModalVisable: false, // 搜索表单显示
      // ===== 数据部分 =====
      papers: [], // 原始论文数据
      currentPage: 1, // 当前页数
    };
  },
  methods: {
    // ===== 筛选条件 =====
    // 时间变化
    dateChange(dates, datesString) {
      console.log("你当前选中的时间是", this.dateValue);
      console.log("你当前选中的时间是", datesString);
      this.datesList = datesString;
    },
    // 关键字搜索
    onSearch() {
      console.log("当前的关键字为", this.keyWord);
    },
    // 清除筛选
    clear() {
      this.datesList = [];
      this.keyWord = "";
      this.articleType = null;
    },
    // ===== 数据操作 =====
    // 卡片展示更多内容
    showDetails(item, index) {
      this.selectedPapers[index].detailVisible =
        !this.selectedPapers[index].detailVisible;
    },
    // 选择所有卡片
    selectAll(e) {
      console.log(e);
      this.selectedPapers.map((item) => {
        item.detailChecked = e.target.checked;
      });
    },

    // 打开搜索框
    openSearch() {
      this.searchModalVisable = true;
    },
    // 关闭搜索框
    closeSearch() {
      this.searchModalVisable = false;
    },
    // 真实搜索
    async realSearch(formData) {
      console.log("返回回来的formDadata", formData);
      try {
        this.closeSearch();
        this.spinning = true;
        if (isEmpty(formData)) {
          openMessage("搜索出错", "存在系统错误，对象为空", 3);
        }
        if (isEmpty(formData.number) || !isNaturalNumber(formData.number)) {
          openMessage("搜索出错", "论文数量不为自然数", 3);
        }

        const postData = {
          articleType: formData.articleType,
          startDate: moment(formData.date[0]).format("yy-MM-DD"),
          endDate: moment(formData.date[1]).format("yy-MM-DD"),
          number: Number(formData.number),
        };
        const data = await searchPapers(postData);
        this.papers = data.data;
      } catch {
        openMessage("搜索出错", "存在未知系统错误", 3);
      } finally {
        this.spinning = false;
      }
    },
    // 导出所有论文
    exportArticles() {},
    // 分页器变化
    changePage(pageNumber) {
      this.currentPage = pageNumber;
    },
  },
  created() {
    this.articleOptions = ARTICLE_OPTIONS;
    this.sortOptions = SORT_OPTIONS;
  },
};
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-body {
  flex: 1;
  display: flex;
  min-height: 90vh; /* 占据屏幕90%高度 */
}

.header {
  background: #fff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  border-bottom: 1px solid #f0f0f0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  height: 60px !important;
  flex-shrink: 0; /* 防止header被压缩 */
}

.left-side {
  background: #fff !important;
  padding: 10px 10px;
  margin: 0 10px 10px 10px;
  height: auto;
  min-height: 100%; /* 确保左侧栏填满高度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.content {
  margin: 0 10px 10px 10px;
  padding: 10px 10px;
  background: #fff;
  min-height: 100%; /* 确保内容区域填满高度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  flex: 1;
}

.footer {
  background: #fff !important;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15) !important;
  border-top: 1px solid #f0f0f0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  height: 50px !important;
  flex-shrink: 0; /* 防止footer被压缩 */
  margin-top: auto; /* 确保footer在底部 */
}

/* 其他样式保持不变 */
#main-top .logo {
  color: #1a56db;
  font-weight: bold;
  font-size: 24px;
  width: auto;
  height: 100%;
  background: none;
}

.select {
  color: black;
  font-weight: bold;
  font-size: 22px;
  width: auto;
  background: none;
  margin-bottom: 20px;
}

.date {
  width: 220px !important;
}

.label {
  color: black;
  font-size: 18px;
  margin-bottom: 5px;
}

.opotions {
  padding-left: 20px;
  margin-bottom: 20px;
  height: auto;
  min-height: 50px;
  width: 100%;
}

.query-search {
  width: 220px !important;
}

.clear {
  margin-left: 10px;
}

.card-row {
  margin-bottom: 10px;
}

.top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
/* card内部样式 */
/* 标题样式 */
.paper-title {
  margin-bottom: 12px;
}

.title-zh {
  font-size: 18px;
  font-weight: 700;
  color: #1a0dab;
  line-height: 1.4;
  margin-bottom: 8px;
  text-align: justify;
}

.title-en {
  font-size: 16px;
  font-weight: 600;
  color: #1a0dab;
  line-height: 1.4;
  margin-bottom: 12px;
  font-style: italic;
  text-align: justify;
}

/* 作者样式 */
.paper-authors {
  margin-bottom: 8px;
}

.authors {
  font-size: 14px;
  color: #1e8449;
  line-height: 1.5;
  margin-bottom: 4px;
  font-weight: 500;
}

/* 元数据样式 */
.paper-meta {
  margin-bottom: 16px;
}

.date {
  font-size: 13px;
  color: #70757a;
  line-height: 1.4;
  margin-bottom: 0;
}

/* 摘要容器 */
.paper-abstract {
  margin-bottom: 16px;
  border-left: 3px solid #e8eaed;
  padding-left: 12px;
}

.paper-abstract-en {
  margin-bottom: 16px;
  border-left: 3px solid #dbeafe;
  padding-left: 12px;
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 4px;
}

.abstract-label {
  font-size: 14px;
  font-weight: 700;
  color: #2c5282;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.abstract-content {
  font-size: 14px;
  line-height: 1.6;
  color: #4a5568;
  text-align: justify;
  margin-bottom: 0;
}

/* 详细信息容器 */
.paper-details {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
</style>
