/**
 * Created by HC1988 on 2015/11/11.
 * lwang1222@gmail.com
 */
;
(function () {

    var fs = window.require("fs");
    var cp = window.require("child_process");
    var exec = cp.exec;
    var shellcmd = {};

    /**
     * 读文件，同步
     * @param filePath
     * @returns {string}
     */
    shellcmd.readFileSync = function (filePath) {
        if (!filePath)
            throw new Error("error arguement");
        try {
            return fs.readFileSync(filePath,{encoding:'utf8'});
        } catch (err) {
            console.error(err.message);
            return "";
        }
    }

    /**
     * 写文件，同步,如果不存在该目录则创建
     * @param {!string} content 可选，如果为空则认为是写入空字符串
     * @param {!string} filePath 文件路径
     */
    shellcmd.writeFileSync = function (filePath, content) {
        if (!filePath)
            throw new Error("error arguement");
        var ct = content || "";
        try {
            mkdirp.sync(path.dirname(filePath));
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
                fs.writeFileSync(filePath, ct);
            } else {
                fs.writeFileSync(filePath, ct);
            }

        } catch (err) {
            console.error(err);
        }

    }
    /**
     * 拷贝文件,异步，有回调
     * @param {!string} src 为原文件路径
     * @param {!string} des 为目标文件
     * @param {function obj} 可选 callback 回调函数 回调中参数不为空则失败
     */
    shellcmd.copyFile = function (src, des, callback) {
        if (!src || !des)
            throw new Error("error arguement");
        src = src.replace(/\\/g, "/");
        des = des.replace(/\\/g, "/");
        try {
            var fileReadStream = fs.createReadStream(src);
            var fileWriteStream = fs.createWriteStream(des);
            fileReadStream.pipe(fileWriteStream);
            fileWriteStream.on('error', function () {
                console.log('copy failed');
                callback && callback('error failed');
            });
            fileWriteStream.on('close', function () {
                console.log('copy over');
                callback && callback(null);
            });
        } catch (e) {
            callback && callback(e);
        }

    }

    /**
     * 打开对话框,依赖Jquery
     * @param {object=}  opt_params  可选参数  eg: {accept: ".doc,.ppt"}
     */
    shellcmd.openFileDialog = function (opt_params) {
        var defer = jQuery.Deferred();
        var fileDialog = jQuery('<input style="display:none;"  type="file"/>');
        if (fileDialog.length) {
            if (opt_params) {
                for (var attr in opt_params)
                    fileDialog.attr(attr, opt_params[attr]);
            }
            fileDialog.one('change', function () {
                defer.resolve(fileDialog.val());
            });
            fileDialog.trigger('click');
            if (opt_params) {
                for (var attr in opt_params)
                    fileDialog.removeAttr(attr);
            }
        }
        return defer.promise();
    }

    /**
     * 保存对话框 依赖Jquery
     * @param opt_params
     * @returns {*}
     */
    shellcmd.saveFileDialog = function (opt_params) {
        opt_params = opt_params || {};
        if (!opt_params.nwsaveas)
            opt_params.nwsaveas = "";
        var defer = jQuery.Deferred();
        this.openFileDialog(opt_params, "save").done(function (ret) {
            console.log("save file: " + ret);
            defer.resolve(ret);
        }).fail(function(){
            defer.reject();
        });
        return defer.promise();
    }

    /**
     * 写入注册表
     * @param regPath {string} 要写入的注册表项路径，例如"HKEY_LOCAL_MACHINE\\SOFTWARE\\iflytek\\LPD /v installPath"
     * @param regValue {string} 写入的值，例如"E:\Project\EPD_EP1.0\Trunk\Development\Source\Client"
     * @param callback 可选参数 返回数据中数据不为空则失败
     */
    shellcmd.writeREG = function (regPath, regValue, callback) {
        regValue = regValue.replace(/ /g, "\" \"");
        var expression = "REG ADD " + regPath + " /t reg_sz /d " + regValue + " /f";
        cp.exec(expression, function (error, stdout, stderr) {
            if (error != null) {
                console.error('exec error:' + error);
                callback && callback(error);
            } else {
                callback && callback();
            }
        });
    }
    /**
     * 静默注册DLL
     * @param dllPath 文件路径 必选
     * @param callback 可选参数 返回数据中数据不为空则失败
     */
    shellcmd.regDll = function (dllPath, callback) {
        if (!dllPath)
            throw new Error("error arguement");
        var cmdLineReg = "regsvr32 \/s \"" + dllPath + "\"";
        try {
            var cmdHandler = exec(cmdLineReg, {
                timeout: 0,
                maxBuffer: 200 * 1024,
                killSignal: 'SIGTERM'
            }, function (error) {
                if (error) {
                    console.log('注册DLL失败' + cmdlineReg)
                    callback && callback(error)
                } else {
                    callback && callback();
                }
            }, {detached: true});
        } catch (e) {
            console.log('error:' + e);
            callback && callback(e);
        }
    }

    /**
     * 检测是否联网 ,异步有回调
     * @param callback {function Object} true 表示联网，false 表示未联网
     */
    shellcmd.checkOnLine = function (callback) {
        var child;
        try {
            child = exec('ping -n 1 -w 200 www.baidu.com', {
                timeout: 0,
                maxBuffer: 200 * 1024,
                killSignal: 'SIGTERM'
            }, function (error, stdout, stderr) {
                if (error !== null) {
                    callback && callback(false);
                }
                else {
                    callback && callback(true);
                }
            });
        } catch (ex) {
            callback && callback(false);
        }
    };
    /**
     * 写日志
     * @param path 文件路径
     * @param msg 必选参数 如果为空则写入空字符串
     */
    shellcmd.log = function (path, msg) {
        var curMsg = msg || "";
        if (!path)
            throw new Error("error arguement");
        fs.appendFile(path, '\r\n ------' + new Date() + ':' + curMsg, function (result) {
            console.log(result);
        });
    }
    /**
     * 查看指定文件或目录是否存在，依赖Jquery
     * @param path 文件路径 必选 类型 String
     * @returns {*}
     */
    shellcmd.fileOrDirExist = function (path) {
        if (!path)
            throw new Error("error arguement");
        var def = $.Deferred();
        try {
            fs.exists(path, function (exist) {
                if(exist){
                    def.resolve();
                }else{
                    def.reject();
                }
            });
        } catch (e) {
            def.reject();
        }

        return def.promise();
    }

    /**
     * 删除文件 异步，依赖Jquery
     * @param fileName 要删除的文件名 必选 类型：string
     */
    shellcmd.deleteFile = function (fileName) {
        if (!fileName)
            throw new Error("error arguement");
        var def = $.Deferred();
        fileName = fileName.replace(/\\/g, "/");
        try {
            fs.unlink(fileName, function (err) {
                if (err) {

                    def.reject(e);
                } else {

                    def.resolve();

                }

            });


        } catch (e) {
            def.reject(e);
        }

        return def.promise();
    };

    /**
     * 删除文件 同步
     * @param fileName 要删除的文件名 必选 类型：string
     */

    shellcmd.deleteFileSync = function (fileName) {
        if (!fileName)
            throw new Error("error arguement");
        fileName = fileName.replace(/\\/g, "/");
        try {
            fs.unlinkSync(fileName);

        } catch (e) {
            console.log('删除文件失败：' + e);
        }
    };


    /**
     * 文件重命名,异步，依赖Jquery
     * @param oldPath 原文件
     * @param newPath 新文件
     * @returns {*}
     */
    shellcmd.rename = function (oldPath, newPath) {
        if (!oldPath || !newPath)
            throw new Error("error arguement");
        var def = $.Deferred();
        try {
            fs.rename(oldPath, newPath, function (err) {
                if (err) {
                    def.resolve();
                } else {
                    def.reject();
                }

            });
        } catch (e) {
            def.reject();
        }

        return def.promise();
    }

    /**
     * 文件重命名,同步
     * @param oldPath 原文件
     * @param newPath 新文件
     */
    shellcmd.renameSync = function (oldPath, newPath) {
        if (!oldPath || !newPath)
            throw new Error("error arguement");
        try {
            fs.renameSync(oldPath, newPath);
        } catch (e) {
        }
    }
    /**
     * 字符串转换为字符串数组
     * @originalStr 字符串
     * @return 转换的结果
     *  示例：'wanglin yulu yimi!@# --asd'
     *  返回：['wanglin','yulu','yimi!@#','--asd']
     *  注意：两个空格在一起会被替换为一个空格
     */
    shellcmd.strToArrary = function (originalStr) {
        originalStr = originalStr.replace(/\s\s*/g, " ");
        var resultStr = [];
        var tempStr = "";
        var flag = false;
        for (var i = 0; i < originalStr.length; i++) {
            if (originalStr[i] == "\"" || originalStr[i] == "\'") {
                flag = !flag;
            } else {
                if (originalStr[i] == " ") {
                    if (flag) {
                        tempStr += originalStr[i];
                    } else {
                        resultStr.push(tempStr);
                        tempStr = "";
                    }

                } else {
                    tempStr += originalStr[i];
                }
            }

        }
        resultStr.push(tempStr);
        return resultStr;
    }

    /**
     * 删除文件夹,文件夹内可包括有其他文件 异步
     * @param path 文件夹路径
     * @param success 回调 可选参数
     */
    shellcmd._rmdirASync = function (path, success) {
        var tempLength;
        var thisFunction = arguments.callee;
        var path = path;
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            tempLength = files.length;
            if (tempLength == 0) {
                fs.rmdirSync(path);
                success && success();
                return;
            }
            files.forEach(function (file) {
                var curPath = path + "/" + file;
                fs.stat(curPath, function (err, stats) {
                    if (!err && stats.isDirectory()) {
                        thisFunction(curPath, function () {
                            console.log(files.length);
                            tempLength--;
                            if (tempLength == 0) {
                                fs.rmdirSync(path);
                                success && success();
                            }

                        });
                    } else {
                        fs.unlink(curPath, function () {
                            tempLength--;
                            if (tempLength == 0) {
                                fs.rmdirSync(path);
                                success && success();
                            }
                        });
                    }
                });

            });

        } else {
            success && success();
        }
    }
    /**
     * 获取当前执行路径
     * @returns {string} 路径信息
     */
    shellcmd.getCurDir = function () {
        var curPath = '';
        try {
            var path = require('path');
            curPath = path.resolve('./').replace(/\\/g, '/');
        } catch (e) {
            curPath = '';
        }
        return curPath;
    }

    /**
     * 读文件，异步,,依赖JQuery
     * @filePath 文件路径
     */
    shellcmd.readFile = function (filePath) {
        if (!filePath)
            throw new Error("error arguement");

        var def = $.Deferred();
        try {
            fs.readFile(filePath, {encoding: 'utf8'}, function (err, data) {
                if (!err) {
                    def.resolve(data);
                } else {
                    def.reject(err);
                }
            });
        } catch (err) {
            def.reject(err);
        }

        return def.promise();

    }

    /**
     * 写文件，异步 ,依赖JQuery
     * @filePath 文件路径
     * @data 要写的内容 类型：string
     */

    shellcmd.writeFile = function (filePath, data) {
        if (!filePath)
            throw new Error("error arguement");
        data = data || "";
        var def = $.Deferred();
        try {
            fs.writeFile(filePath, data, {encoding: 'utf8'}, function (err, data) {
                if (!err) {
                    def.resolve(data);
                } else {
                    def.reject(err);
                }
            });
        } catch (err) {
            def.reject(err);
        }

        return def.promise();

    }


    window.shellcmd = shellcmd;
})();
