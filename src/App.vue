<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { Get_pics, Get_photo, Up_config } from '@/backend/api'
import VPannellum from "vue-pannellum";
import debounce from 'lodash.debounce'
import dayjs from "dayjs";

const all_tmp = ref([])
const vv = ref(null)
const pic = ref("")
const rotate = ref(false)
const name = ref('')
const index = ref(0)
//----------螢幕解析度-----------
const viewer = ref(1)
const width = ref(1920)
const height = ref(1080)
const bottom = ref(0)
//----------更換路徑----------
const input_path = ref('')
const pic_time = ref('')
//-----------自動換業----------
const auto_pg = ref(false)
const destroy_count = ref(0)
//---------計時器-----------
let timer1 = ref(null)
//---------------------
onMounted(async () => {
  let res = await Get_pics()
  all_tmp.value = res.data
  name.value = all_tmp.value[0]
  await Photo(all_tmp.value[0])
  document.addEventListener("keydown", keyboard, true)
})


onBeforeUnmount(() => {
  document.removeEventListener("keydown", keyboard, true)
  clearTimeout(timer1.value);
})


//用戶操作 停止換頁
watch(() => rotate.value, () => {
  auto_pg.value = false
})




//鍵盤事件
function keyboard(e) {
  if (e.key === "PageUp" || e.key === "ArrowLeft") {
    //往前一張
    if (index.value === 0) {
      ElNotification({
        title: '錯誤訊息',
        dangerouslyUseHTMLString: true,
        message: '<h2 style="color:red">沒有照片</h2>',
      })
      return
    }
    de_forward()
    auto_pg.value = false
  } else if (e.key === "PageDown" || e.key === "ArrowRight") {
    if (all_tmp.value.length === index) {
      ElNotification({
        title: '錯誤訊息',
        dangerouslyUseHTMLString: true,
        message: '<h2 style="color:red">沒有照片</h2>',
      })
      return
    }
    de_back()
    auto_pg.value = false
  } else if (e.key === "q") {
    //連續5張往前  
    if (index.value - 4 < 0) {
      ElNotification({
        title: '錯誤訊息',
        dangerouslyUseHTMLString: true,
        message: '<h2 style="color:red">沒有照片</h2>',
      })
      return
    }
    de_forward5()
    auto_pg.value = false
  } else if (e.key === "r") {
    //連續5張往後
    if (index.value + 4 > all_tmp.value.length) {
      ElNotification({
        title: '錯誤訊息',
        dangerouslyUseHTMLString: true,
        message: '<h2 style="color:red">沒有照片</h2>',
      })
      return
    }
    de_back5()
    auto_pg.value = false
  }
}

const de_back = debounce(() => {
  back()
}, 500)

const de_forward = debounce(() => {
  forward()
}, 500)


const de_back5 = debounce(() => {
  five_back()
}, 500)

const de_forward5 = debounce(() => {
  five_forward()
}, 500)


function _base64ToArrayBuffer(base64) {
  let binary_string = window.atob(base64);
  let len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}


async function Photo(data) {

  destroy_count.value = destroy_count.value + 1

  if (destroy_count.value === 5) {
    vv.value.viewer.destroy()
    destroy_count.value = 0
  }
  let res = await Get_photo({ photo: data })
  pic_time.value = dayjs(res.data.date).format("YYYY/MM/DD HH:mm:ss");
  let arrayBuffer = _base64ToArrayBuffer(res.data.file.fileContents);
  pic.value = URL.createObjectURL(new Blob([arrayBuffer], { type: 'image/jpeg' }))
}



//設定選轉
function fn_rotate(e) {
  //取得設定值
  let info = vv.value.viewer.getConfig()
  info.autoRotate = e
}

//設定螢幕寬度
function fn_select(e) {
  if (e === 1) {
    width.value = 1920
    height.value = 1080
    bottom.value = 0
  } else if (e === 2) {
    width.value = 1280
    height.value = 720
    bottom.value = 22
  } else if (e === 3) {
    width.value = 1024
    height.value = 768
    bottom.value = 16.3
  }
}

async function forward() {
  index.value = index.value - 1
  await Photo(all_tmp.value[index.value])
  name.value = all_tmp.value[index.value]
  nextTick(() => {
    let info = vv.value.viewer.getConfig()
    info.autoRotate = rotate.value
  })
}

async function five_forward() {
  index.value = index.value - 4
  await Photo(all_tmp.value[index.value])
  name.value = all_tmp.value[index.value]
  nextTick(() => {
    let info = vv.value.viewer.getConfig()
    info.autoRotate = rotate.value
  })
}


async function back() {
  index.value = index.value + 1
  await Photo(all_tmp.value[index.value])
  name.value = all_tmp.value[index.value]
  nextTick(() => {
    let info = vv.value.viewer.getConfig()
    info.autoRotate = rotate.value
  })
}

async function five_back() {
  index.value = index.value + 4
  await Photo(all_tmp.value[index.value])
  name.value = all_tmp.value[index.value]
  nextTick(() => {
    let info = vv.value.viewer.getConfig()
    info.autoRotate = rotate.value
  })
}





async function fn_path() {
  if (input_path.value.length === 0) {
    return
  }
  let res = await Up_config(input_path.value)
  if (res.data === "找不到") {
    ElNotification({
      title: '錯誤訊息',
      dangerouslyUseHTMLString: true,
      message: '<h2 style="color:red">路徑!!不存在</h2>',
    })
    return
  } else {
    ElNotification({
      title: '修改成功',
      dangerouslyUseHTMLString: true,
      message: '<h2 style="color:green">沒有更新請按f5</h2>',
    })
    window.location.reload();
  }
}

function fn_full() {
  vv.value.viewer.toggleFullscreen()
  nextTick(() => {
    let info = vv.value.viewer.getConfig()
    info.autoRotate = rotate.value
  })
}


function fn_page() {
  if (auto_pg.value === true) {
    switch (rotate.value) {
      case 4:
        turn(90 * 1000)
        break
      case 6:
        turn(60 * 1000)
        break
      case 9:
        turn(40 * 1000)
        break
      case false:
        turn(15 * 1000)
        break
    }
  }
}


function turn(second) {
  timer1.value = setTimeout(async () => {
    let time = second
    if (auto_pg.value === false) {
      clearTimeout(timer1.value);
      return
    }
    await back()
    turn(time)
  }, second)
}

function stop_timer() {
  auto_pg.value = false
}




</script>

<template>
  <div>
    <v-pannellum ref="vv" class="pannellum" :src="pic" :auto-load="true" :yaw.sync="7" :pitch.sync="0" :compass="true"
      :hfov="120" :autoRotate="rotate">
    </v-pannellum>
    <div class="wrap">
      <h1 class="title pos">{{ pic_time }}</h1>
      <el-switch v-model="auto_pg" inline-prompt size="large" @change="fn_page()"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" active-text="會換" inactive-text="不換" />
      <el-tooltip class="box-item" effect="dark" placement="top">
        <template #content>
          <h2>字母q快速鍵</h2>
        </template>
        <el-button type="success" @click="five_forward(), stop_timer()" :disabled="index - 4 < 0"
          style="transform: translateX(5px);">-5</el-button>
      </el-tooltip>
      <el-tooltip class="box-item" effect="dark" placement="top">
        <template #content>
          <h2>鍵盤9<br />或⬅</h2>
        </template>
        <el-button type="primary" @click="forward(),
          stop_timer()" :disabled="index === 0" style="transform: translateX(5px);">-1</el-button>
      </el-tooltip>
      <el-tooltip class="box-item" effect="dark" content="<h2>鍵盤3或⮕</h2>" placement="top" raw-content>
        <el-button type="primary" @click="back(),
          stop_timer()" :disabled="all_tmp.length === index">+1</el-button>
      </el-tooltip>
      <el-tooltip class="box-item" effect="dark" content="<h2>字母r快速鍵</h2>" placement="top" raw-content>
        <el-button type="success" @click="five_back(), stop_timer()" :disabled="index + 4 > all_tmp.length">+5</el-button>
      </el-tooltip>
      <span class="title">{{ name }}</span>
      <div style="margin-top: 10px;">
        <el-radio-group v-model="rotate" @change="fn_rotate" size="large">
          <el-radio-button :label="4">4度</el-radio-button>
          <el-radio-button :label="6">6度</el-radio-button>
          <el-radio-button :label="9">9度</el-radio-button>
          <el-radio-button :label="false">不轉</el-radio-button>
        </el-radio-group>
        <el-button type="success" @click="fn_full()" plain class="src_full">全螢幕</el-button>
        <el-radio-group v-model="viewer" @change="fn_select" style="margin-left: 20px;" :fill="'black'">
          <el-radio-button :label="1">1920 X 1080</el-radio-button>
          <el-radio-button :label="2">1280 X 720</el-radio-button>
          <el-radio-button :label="3">1024 X 768</el-radio-button>
        </el-radio-group>
        <div>
          <el-input v-model.trim="input_path" placeholder="請輸入路徑+記得輸入完要按enter+按f5" clearable @keyup.enter="fn_path" />
        </div>
      </div>
    </div>
  </div>
</template>


<style>
.src_full {
  transform: translate(10px, 5px);
}

.el-radio {
  color: teal;
}

* {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.el-radio-button__inner {
  padding: 8px 5px;
}

.pannellum {
  height: v-bind(height + 'px');
  width: v-bind(width + 'px');
  position: relative;
}



.wrap {
  position: absolute;
  bottom: v-bind(bottom + '%');
  left: 0%;
  z-index: 999;
}


.title {
  color: white;
  font-size: 17px;
  display: inline-block;
  font-weight: 500;
  transform: translate(5px, 7px);
}

.pos {
  position: fixed;
  right: 2%;
  bottom: 1%;
  font-size: 50px;
}
</style>