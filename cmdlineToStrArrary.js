
/* 示例：'wanglin yulu yimi!@# --asd'
返回：['wanglin','yulu','yimi!@#','--asd']
注意：两个空格在一起会被替换为一个空格 */

function cmdlineToStrArrary(originalStr) {
//返回字符串数组
   originalStr = originalStr.replace(/\s\s*/g," ")
    var cmdlineStr = [];
    var tempStr = "";
    var flag = false;
    for (var i = 0; i < originalStr.length; i++) {
        if (originalStr[i] == "\"" || originalStr[i] == "\'") {
            flag = !flag;
//            tempStr+=originalStr[i];
        } else {
            if (originalStr[i] == " ") {
                if (flag) {
                    tempStr += originalStr[i];
                } else {
                    cmdlineStr.push(tempStr);
                    tempStr = "";
                }

            } else {
                tempStr += originalStr[i];
            }
        }

    }
    cmdlineStr.push(tempStr);
    return cmdlineStr;
}
