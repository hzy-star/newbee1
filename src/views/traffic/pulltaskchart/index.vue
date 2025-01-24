<template>
    <div class="pulltaskchart">
        <div class="pulltaskchart_header">
            <!-- 查询条件 -->
            <el-row :gutter="20" type="flex" justify="start">
                <!-- Data -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Data</div>
                        <el-date-picker style="width: 500px;" v-model="FormData.baseDate" type="date"
                            placeholder="选择日期">
                        </el-date-picker>
                        <div class="form-item-label">Plus</div>
                        <el-input v-model="FormData.dayStep" />

                    </div>
                </el-col>

                <!-- Offers -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Offer</div>
                        <el-input v-model="FormData.offerId" />
                    </div>
                </el-col>

                <!-- Apps -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Apps</div>
                        <el-input v-model="FormData.appId" />
                    </div>
                </el-col>

                <!-- Pkg -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Pkg</div>
                        <el-input v-model="FormData.pkgName" />
                    </div>
                </el-col>

                <!-- Task -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Task</div>
                        <el-input v-model="FormData.taskId" />
                    </div>
                </el-col>

                <!-- GroupBy -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">GroupBy</div>
                        <el-select v-model="FormData.groupBy" placeholder="">
                            <el-option label="hour" value="hour" />
                            <el-option label="TaskId" value="taskid" />
                        </el-select>
                    </div>
                </el-col>
                <!-- etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">etype</div>
                        <el-select v-model="FormData.etype" placeholder="">
                            <el-option label="all" value="all" />
                            <el-option label="click" value="click" />
                            <el-option label="impression" value="imp" />
                        </el-select>
                    </div>
                </el-col>
                <!-- etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Country</div>
                        <el-input v-model="FormData.country" />
                    </div>
                </el-col>
                <!-- button -->
                <el-col :span="4">
                    <div class="form-item">
                        <el-button type="primary" @click="ShowChart">ShowChart</el-button>
                    </div>
                </el-col>
            </el-row>
        </div>

        <div class="pulltaskchart_radio">
            <el-radio v-model="radio" label="expectCount">expectCount</el-radio>
            <el-radio v-model="radio" label="sendCount">sendCount</el-radio>
        </div>

        <!-- 数据表格 -->
        <div class="pulltaskchart_table">
            <div id="taskCountChart" style="width: 100%; height: 400px;"></div>
        </div>

        <div class="pulltaskchart_footer">
            <div id="taskSuccessRateChart" style="width: 100%; height: 400px;"></div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { toDateStr } from '@/utils/time'
import { ElMessage } from 'element-plus'
import { formatData, paramsData } from '@/api/traffic/pulltaskchart/type'
import * as echarts from 'echarts'
import { reqCountTaskHour } from '@/api/traffic/pulltaskchart'

const dataTime = ref(toDateStr(new Date(), true))
const FormData = ref<formatData>({
    baseDate: dataTime.value,
    dayStep: '-1',
    offerId: '',
    appId: '',
    pkgName: '',
    taskId: '',
    groupBy: 'hour',
    etype: 'click',
    country: ''
})
const radio = ref('expectCount')
// 显示图表 任务实际量级
let resData = ref([])
// 显示图表环境预估量级
let environment = ref({})

// 监听radio的变化
watch(radio, (newValue) => {
    console.log("Radio changed to:", newValue);
    updateCharts(true);
});

// 监听 baseDate 的变化并格式化
watch(() => FormData.value.baseDate, (newDate: any) => {
    if (newDate instanceof Date) {
        FormData.value.baseDate = newDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'); // 格式化为 YYYY-MM-DD
    }
});

// 计算日期范围
const calculateDays = (baseDate: any, dayStep: any) => {
    const startDate = new Date(baseDate);
    const step = parseInt(dayStep, 10);
    const daysArray = [];

    for (let i = 0; i <= Math.abs(step); i++) {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + (step > 0 ? i : -i));
        daysArray.push(newDate.toISOString().split('T')[0]);
    }

    return daysArray.join(',');
};

// 定义ShowChart函数
const ShowChart = async () => {
    let params: paramsData = {
        countryos: JSON.stringify({
            adx: FormData.value.adx,
            country: FormData.value.country,
            os: FormData.value.os
        }),
        startday: FormData.value.baseDate,
        step: parseInt(FormData.value.dayStep),
        days: calculateDays(FormData.value.baseDate, FormData.value.dayStep),
        offer: FormData.value.offerId,
        pkg: FormData.value.pkgName,
        taskid: FormData.value.taskId,
        groupby: FormData.value.groupBy,
        etype: FormData.value.etype == 'all' ? '' : FormData.value.etype,
        app: FormData.value.appId,
        country: FormData.value.country,
    };
    // let res = await reqCountTaskHour(params)
    // resData.value = res
    resData.value = [
        {
            "taskhourserver": {
                "0": 150821151.34269512,
                "1": 130269634.50254682,
                "2": 130503942.52516586,
                "3": 135657550.09857854,
                "4": 131754273.21127696,
                "5": 133386372.21759003,
                "6": 123296668.91481218,
                "7": 110650549.3325611,
                "8": 107091976.32222846,
                "9": 111654098.88932803,
                "10": 128257301.4151939,
                "11": 142075885.0192344,
                "12": 156463179.8914566,
                "13": 162543556.75929275,
                "14": 160172460.08945146,
                "15": 156167728.3608801,
                "16": 152675783.46802294,
                "17": 150844931.63826102,
                "18": 151177233.32318163,
                "19": 157482319.8394515,
                "20": 160690031.14594492,
                "21": 157270358.84987718,
                "22": 145479689.23295796,
                "23": 134658960.61001116
            },
            "taskhourok": {
                "0": 26585269.879928578,
                "1": 28584880.90698172,
                "2": 27147484.63198172,
                "3": 27868527.987537276,
                "4": 28133801.608172197,
                "5": 29149966.471556034,
                "6": 26151424.866000485,
                "7": 26550755.744607978,
                "8": 25517122.32933684,
                "9": 24879931.92807422,
                "10": 26737524.419993408,
                "11": 28695880.718983315,
                "12": 32183306.352316666,
                "13": 33015324.836527187,
                "14": 32914060.377003383,
                "15": 32450888.33255892,
                "16": 32380111.585336693,
                "17": 31975162.827003367,
                "18": 31548382.053518523,
                "19": 31882652.94240741,
                "20": 24935688.606043767,
                "21": 22244200.88407406,
                "22": 19998898.384074066,
                "23": 18071458.325982273
            },
            "day": "20250123",
            "taskhour": {
                "0": 257067641.7163462,
                "1": 228564675.33953464,
                "2": 222139137.56175685,
                "3": 222376969.0062013,
                "4": 214433186.78397912,
                "5": 205874049.0062014,
                "6": 185396297.89509016,
                "7": 155975055.35540757,
                "8": 145677521.554238,
                "9": 153179540.54413703,
                "10": 174433967.2108037,
                "11": 201480682.76635927,
                "12": 222248971.65524828,
                "13": 230446412.1230845,
                "14": 228304887.67864004,
                "15": 225544807.67864004,
                "16": 222492154.34530666,
                "17": 221678491.48816383,
                "18": 232758887.04371938,
                "19": 238000620.37705272,
                "20": 258892940.37705272,
                "21": 269332589.2659416,
                "22": 254183827.64978,
                "23": 238874652.5773162
            }
        },
        {
            "taskhourserver": {
                "0": 107570605.6689595,
                "1": 97628513.41219313,
                "2": 97619469.86158927,
                "3": 99541803.87706542,
                "4": 94995421.90166858,
                "5": 86843266.6850019,
                "6": 76613778.13500187,
                "7": 63140454.02349402,
                "8": 58042409.961798124,
                "9": 50627235.68730317,
                "10": 39460334.869842805,
                "11": 38080688.054691315,
                "12": 41684289.16428727,
                "13": 45762248.43987207,
                "14": 44759490.99225303,
                "15": 46139833.24741176,
                "16": 45375724.00852287,
                "17": 45444078.88352287,
                "18": 53152868.31047091,
                "19": 56764722.72991535,
                "20": 77917523.47003081,
                "21": 88464860.66487205,
                "22": 87428023.58103368,
                "23": 86112871.36919795
            },
            "taskhourok": {
                "0": 21428133.0764227,
                "1": 22539333.986567635,
                "2": 22054602.293451685,
                "3": 21993444.946229465,
                "4": 22148695.554165974,
                "5": 20578754.884721525,
                "6": 17668742.451388195,
                "7": 16204301.188004352,
                "8": 15225168.626162246,
                "9": 13742068.262778405,
                "10": 8662057.12944507,
                "11": 6988788.8819703255,
                "12": 6966425.243081438,
                "13": 7912387.788256876,
                "14": 7874999.380320367,
                "15": 8114010.149764812,
                "16": 8133087.896987034,
                "17": 8133008.021987034,
                "18": 9563442.341431478,
                "19": 9740382.716431478,
                "20": 11474992.804815317,
                "21": 12792467.380212141,
                "22": 12743509.65748487,
                "23": 12416772.33791965
            },
            "day": "20250124",
            "taskhour": {
                "0": 159914421.98810592,
                "1": 152419944.83395568,
                "2": 147966300.38951126,
                "3": 155830136.27840015,
                "4": 156909851.8339557,
                "5": 159367585.16728902,
                "6": 160380527.3895113,
                "7": 147148372.46887636,
                "8": 140882661.12384716,
                "9": 133204158.56829156,
                "10": 116651314.12384713,
                "11": 114432445.84101886,
                "12": 111393942.60869561,
                "13": 110176827.28705817,
                "14": 105405027.28705819,
                "15": 102274387.28705819,
                "16": 100769747.2870582,
                "17": 100774604.42991534,
                "18": 112175551.09658197,
                "19": 117420395.54102641,
                "20": 138533137.76324862,
                "21": 147268213.31880423,
                "22": 140616386.65213752,
                "23": 131018181.43474622
            }
        }
    ]
    environment.value = {
        "ym_env1": {
            "0": 371145013.6457744,
            "1": 338173249.7226299,
            "2": 344141572.0559632,
            "3": 478413357.77024883,
            "4": 485844786.3416774,
            "5": 496873357.7702488,
            "6": 504871294.27818525,
            "7": 503005421.2623123,
            "8": 498655421.2623123,
            "9": 508150875.80776685,
            "10": 511498603.0804941,
            "11": 502748603.0804941,
            "12": 507048603.0804941,
            "13": 507048603.0804941,
            "14": 503048603.0804941,
            "15": 505288603.0804941,
            "16": 505038603.0804941,
            "17": 500698603.0804941,
            "18": 497864158.6360497,
            "19": 494423087.2074783,
            "20": 460838087.20747834,
            "21": 416149253.87414515,
            "22": 391489708.41959965,
            "23": 372882541.0941715
        },
        "ym_env6": {
            "0": 569458594.25043,
            "1": 557623724.1205597,
            "2": 562234835.2316709,
            "3": 522433247.9300836,
            "4": 517770946.34278196,
            "5": 498638089.1999248,
            "6": 408052374.91421056,
            "7": 394714387.8512235,
            "8": 422724777.4616132,
            "9": 435855896.34273213,
            "10": 480518522.6053583,
            "11": 520211494.0559383,
            "12": 526197829.45966506,
            "13": 520662115.17395073,
            "14": 525804972.3168079,
            "15": 517471638.9834746,
            "16": 500721638.9834746,
            "17": 497578781.8406174,
            "18": 539912115.1739508,
            "19": 539245448.5072842,
            "20": 541878305.6501412,
            "21": 546539972.3168079,
            "22": 518720924.6977603,
            "23": 519062699.5895352
        },
        "ym_env7": {
            "0": 1594724116.5223672,
            "1": 1338118560.9668117,
            "2": 676920465.7287159,
            "3": 737969513.6810968,
            "4": 756210148.6017318,
            "5": 758659037.4906206,
            "6": 745974593.0461758,
            "7": 743633720.030303,
            "8": 746083720.030303,
            "9": 770698113.9696969,
            "10": 809974621.9062049,
            "11": 829836288.5728717,
            "12": 836013272.6998559,
            "13": 822124383.8109671,
            "14": 817456129.8427131,
            "15": 805730415.5569988,
            "16": 801313748.8903321,
            "17": 1467266129.842713,
            "18": 1454699066.3506494,
            "19": 1455237955.2395382,
            "20": 1461902494.922078,
            "21": 1468217971.112554,
            "22": 1464625546.8701298,
            "23": 1463069991.3145742
        },
        "ym_env8": {
            "0": 71153333.33333331,
            "1": 67833333.33333331,
            "2": 70333333.33333331,
            "3": 113622222.22222221,
            "4": 115498412.6984127,
            "5": 113118412.6984127,
            "6": 119557301.5873016,
            "7": 117471587.3015873,
            "8": 116471587.30158728,
            "9": 116671587.30158728,
            "10": 122708888.88888888,
            "11": 138908888.88888893,
            "12": 135186666.66666666,
            "13": 135186666.66666666,
            "14": 135186666.66666666,
            "15": 135186666.66666666,
            "16": 133186666.66666666,
            "17": 133186666.66666666,
            "18": 129742222.22222221,
            "19": 129742222.22222221,
            "20": 125492222.22222222,
            "21": 119603333.33333333,
            "22": 111325555.55555555,
            "23": 99025555.55555555
        },
        "ym_env9": {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0,
            "20": 0,
            "21": 0,
            "22": 0,
            "23": 0
        },
        "ym_env2": {
            "0": 793916241.0429983,
            "1": 777731097.527094,
            "2": 715092461.1634574,
            "3": 756251294.4967909,
            "4": 799045104.0206006,
            "5": 828203437.3539339,
            "6": 826584389.7348864,
            "7": 827184389.7348864,
            "8": 834467723.0682198,
            "9": 834480223.0682198,
            "10": 824105223.0682198,
            "11": 811077950.340947,
            "12": 830280223.0682198,
            "13": 827230223.0682198,
            "14": 835396889.7348864,
            "15": 835921889.7348864,
            "16": 767646889.7348864,
            "17": 718505223.0682195,
            "18": 709173080.2110767,
            "19": 691139746.8777435,
            "20": 648198794.3467911,
            "21": 608551889.5848864,
            "22": 576212820.3208169,
            "23": 653222794.6291173
        },
        "ym_env3": {
            "0": 521308635.4182146,
            "1": 518982686.14285237,
            "2": 528958638.5238047,
            "3": 583671012.2611783,
            "4": 588596012.2611783,
            "5": 642697765.5079312,
            "6": 665208179.6493453,
            "7": 692505401.8715677,
            "8": 686848783.0517908,
            "9": 716532116.3851242,
            "10": 703357358.8093666,
            "11": 705489858.8093666,
            "12": 742457283.0517912,
            "13": 746566932.1745982,
            "14": 745383598.8412648,
            "15": 700203598.8412646,
            "16": 690361932.1745977,
            "17": 684045265.5079311,
            "18": 652501932.1745977,
            "19": 648124352.8095185,
            "20": 625287686.1428518,
            "21": 614323694.07936,
            "22": 600580815.2914813,
            "23": 578410960.2190176
        },
        "ym_env4": {
            "0": 208979209.95670998,
            "1": 202738222.7555054,
            "2": 199319182.351465,
            "3": 240815141.94742468,
            "4": 284093929.8262125,
            "5": 293920748.0080307,
            "6": 335572515.6847983,
            "7": 339057364.16964674,
            "8": 341794737.9070205,
            "9": 341794737.9070205,
            "10": 349576253.05853564,
            "11": 350420697.5029801,
            "12": 344754030.8363135,
            "13": 345087364.16964674,
            "14": 345087364.16964674,
            "15": 352658792.74107534,
            "16": 323158792.74107534,
            "17": 322658792.7410753,
            "18": 304350459.40774196,
            "19": 297017126.07440865,
            "20": 281972959.407742,
            "21": 270880895.91567856,
            "22": 270370895.91567856,
            "23": 264459784.80456746
        },
        "ym_env5": {
            "0": 1349906980.492589,
            "1": 1272226313.8259225,
            "2": 923900758.270367,
            "3": 963384418.4010859,
            "4": 1043245132.6868001,
            "5": 987828466.0201337,
            "6": 834798379.4400467,
            "7": 803709364.2885313,
            "8": 1030993455.1976229,
            "9": 1236982849.1370163,
            "10": 1447623581.3916893,
            "11": 1538376409.6745172,
            "12": 1541898845.5719528,
            "13": 1530894083.667191,
            "14": 1528238528.1116354,
            "15": 1547335750.3338578,
            "16": 1551194083.667191,
            "17": 1545460750.3338578,
            "18": 1551269083.667191,
            "19": 1541974639.2227464,
            "20": 1547390043.2631505,
            "21": 1543738528.1116354,
            "22": 1545471861.444969,
            "23": 1600467694.778303
        }
    }
    updateCharts();
}

// 更新图表的函数
const updateCharts = (type) => {
    // 获取当前选中的radio值
    const selectedRadio = radio.value;

    // 根据选中的radio值来决定使用的数据类型
    let taskCountKeys;
    if (selectedRadio === 'expectCount') {
        taskCountKeys = ["taskhourok", "taskhour"];
    } else if (selectedRadio === 'sendCount') {
        taskCountKeys = ["taskhourok", "taskhourserver"];
    }
    // 渲染任务流量图表
    renderChart(resData.value, document.getElementById("taskCountChart"), taskCountKeys);
    if (!type) {
        // 渲染成功率图表
        renderSuccessRateChart(environment.value, document.getElementById("taskSuccessRateChart"), taskCountKeys);
    }
}

// 渲染任务流量图表的函数
const renderChart = (data: any, container: any, keyNames: any) => {
    const chartEle = container;
    // 销毁现有的图表实例
    if (echarts.getInstanceByDom(chartEle)) {
        echarts.dispose(chartEle);
    }
    const trafficChart = echarts.init(chartEle);
    trafficChart.clear();

    const hours = Array.from({ length: 24 }, (_, i) => i + 1);
    const seriesDataArr: any[] = [];

    data.forEach((dayData: any) => {
        keyNames.forEach((countName: any) => {
            const taskCountOfHour = dayData[countName] || {};
            const taskCountArr = hours.map((hour: any) => taskCountOfHour[hour] || 0);

            const isDeviceCountEvent = countName.indexOf("ok") === -1;
            const charCountName = isDeviceCountEvent ? '任务流量' : '成功流量';

            seriesDataArr.push({
                name: dayData.day + "_" + charCountName,
                type: isDeviceCountEvent ? 'line' : "bar",
                data: taskCountArr,
                smooth: true,
                yAxisIndex: isDeviceCountEvent ? 0 : 1,
            });
        });
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            confine: true, // 确保 tooltip 在图表区域内
        },
        title: {
            text: 'task实际量级',
            textStyle: {
                fontSize: 22 // 你可以根据需要调整字体大小
            }
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            top: 'top',
            width: '80%',
            data: seriesDataArr.map(series => series.name)
        },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false, data: hours },
        yAxis: [
            { type: 'value', name: "请求量" },
            { type: 'value', name: "成功量" }
        ],
        series: seriesDataArr
    };

    trafficChart.setOption(option);
}

// 渲染成功率图表的函数
const renderSuccessRateChart = (data: any, container: any, keyNames: any) => {
    const chartEle = container;
    // 销毁现有的图表实例
    if (echarts.getInstanceByDom(chartEle)) {
        echarts.dispose(chartEle);
    }
    const trafficChart = echarts.init(chartEle);
    trafficChart.clear();

    const hours = Array.from({ length: 24 }, (_, i) => i); // X轴从0开始
    const seriesDataArr: any[] = [];

    // 遍历 environment 数据
    Object.keys(data).forEach((envKey) => {
        const dayData = data[envKey];
        const dayValues: any[] = hours.map((hour: any) => dayData[hour] || 0); // 获取每小时的数据

        seriesDataArr.push({
            name: envKey,
            type: "line",
            data: dayValues,
            smooth: true
        });
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            confine: true // 确保 tooltip 在图表区域内
        },
        title: { text: '环境预估量级', textStyle: { fontSize: 22 } },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            top: 'top',
            width: '80%',
            data: seriesDataArr.map(series => series.name) // 使用 environment 的键作为图例名称
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false, data: hours },
        yAxis: [
            { type: 'value',  } // Y轴名称可以根据需要调整
        ],
        series: seriesDataArr
    };

    trafficChart.setOption(option);
}

onMounted(() => {
    ShowChart();

    // 添加窗口resize事件监听器
    window.addEventListener('resize', handleResize);
});

// 处理窗口resize事件 自适应窗口大小
const handleResize = () => {
    // 获取图表实例并调用resize方法
    const taskCountChartElement = document.getElementById("taskCountChart");
    const taskSuccessRateChartElement = document.getElementById("taskSuccessRateChart");

    if (taskCountChartElement) {
        const taskCountChart = echarts.getInstanceByDom(taskCountChartElement);
        if (taskCountChart) {
            taskCountChart.resize();
        }
    }

    if (taskSuccessRateChartElement) {
        const taskSuccessRateChart = echarts.getInstanceByDom(taskSuccessRateChartElement);
        if (taskSuccessRateChart) {
            taskSuccessRateChart.resize();
        }
    }
};
</script>

<style scoped lang="scss">
.pulltaskchart {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 120px);

    .pulltaskchart_header,
    .pulltaskchart_radio {
        flex: 0 0 auto; // 固定高度
        min-height: 50px; // 设置最小高度
    }

    .pulltaskchart_table,
    .pulltaskchart_footer {
        flex: 1 1 50%; // 平均分配剩余空间
        min-height: 400px; // 设置最小高度
    }
}

.el-row {
    margin-bottom: 20px;
}

.el-col {
    margin: 5px 0;
}

.el-table {
    margin-top: 20px;
}

/* 使标签和输入框对齐 */
.form-item-label {
    font-weight: bold;
    color: #606266;
    margin: 0 10px;
    text-align: left;
}

/* 每一行输入框和拉框的样式 */
.form-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

/* 按钮区域布局 */
.form-item-buttons {
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    margin-top: 20px;
}

/* 左侧按钮 */
.form-item-left {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}

/* 右侧按钮 */
.form-item-right {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.icon-echarts {
    cursor: $base-cursor;
    display: flex;
    justify-content: center;
    align-items: center;
}

.popoverClass {
    max-height: 500px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    padding: 10px;
    overflow: scroll;
}
</style>