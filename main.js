const { app, contextBridge, ipcRenderer } = require('electron')
const Vue = require('vue')

class HTTPrequest{

    constructor(url = "", uid){
        this.Uid = uid
        this.url = url
        this.method = ""
        this.headers = []
        this.body = ""
        this.responseData = null
    }

    appendHeader(key, value){
        let newHeader = {key: key, value: value}
        this.headers.push(newHeader)
    }

    removeHeader(key){
        this.headers.forEach((headerObj, index) => {
            if(headerObj.key === key){
                this.headers.splice(index, 1)
            }
        })
    }

    async sendReq(){
        let url=this.url.replace(/\s/g,'');
        if(url === ""){
            alert("Url cannot be empty")
            return;
        }
        let headersObj = {}
        this.headers.forEach(item => {
            headersObj[item.key] = item.value
        })
        let reqRes = null
        if(this.method == "POST"){
            reqRes = await this.POSTreq(headersObj)
        }else if(this.method == "GET"){
            reqRes = await this.GETreq(headersObj)
        }
        await this.resolveResponse(reqRes)
        return reqRes
    }

    async POSTreq(headersObj){
        let req = await fetch(this.url, {
            headers: headersObj,
            method: 'POST',
            body: this.body
        })
        return req
    }

    async GETreq(headersObj){
        let req = await fetch(this.url, {
            headers: headersObj,
            method: 'GET'
        })
        return req
    }

    async resolveResponse(response){
        this.responseData = await response.text()
    }

}
class Tab{
    constructor(req){
        this.uid = genString(6)
        this.reqObj = req
        this.title = req.url
        this.isActive = true
    }
}
let initialTab = new Tab(new HTTPrequest.HTTPrequest("url..", genString(6)))
const reqApp = Vue.createApp({
    data(){
        return {
            opennedTabs: [initialTab],
            currentTab: initialTab,
            reqData: {},
            showRequestUI: true
        }
    },
    methods: {
        newTabClick(){
            this.showRequestUI = true
            let newTab =  new Tab(new HTTPrequest.HTTPrequest("", genString(6)))
            this.opennedTabs.push(newTab)
            this.currentTab = newTab
            this.opennedTabs.forEach(element => {
                if(element.uid !== newTab.uid){ element.isActive = false } 
            });
        },
        closeTabClick(tabToClose){
            this.opennedTabs.forEach((opentab, index) => {
                if(opentab.uid === tabToClose.uid){
                    this.opennedTabs.splice(index, 1)
                }
            });
            if(this.opennedTabs.length < 1){
                this.showRequestUI = false
            }
        },
        tabClick(tabClicked){
            this.opennedTabs.forEach((tab, index) => {
                if(tabClicked.uid === tab.uid){
                    tab.isActive = true
                    this.currentTab = tab
                }else{
                    tab.isActive = false
                }
            })
        },
        async sendReqButtonClick(){
            await this.currentTab.reqObj.sendReq()
        },
        addNewButtonHeadersTable_Click(){
            this.currentTab.reqObj.headers.push({key: '', value: ''})
        },
        deleteButtonHeaderstableRow_Click(rowIndex){
            this.currentTab.reqObj.headers.splice(rowIndex,1);
        }
    },
});
const reqComponent = reqApp.mount("#mainSection")
ipcRenderer.on('touch-bar-send-req', (evt, arg) => {
    reqComponent.sendReqButtonClick()
})

ipcRenderer.on('touch-bar-req-add-header', (req, arg) => {
    reqComponent.addNewButtonHeadersTable_Click()
})

function genString(len){
    let str = "";
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ ){
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}
