import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("Erars", {
  launch: () => ipcRenderer.invoke("erars:launch"),
  getState: () => ipcRenderer.sendSync("erars:getState"),

  stdin: (input: string) => ipcRenderer.invoke("erars:stdin", input),
  stdout: () => ipcRenderer.invoke("erars:stdout"),
});

contextBridge.exposeInMainWorld("TitleButton", {
  isMaximized: () => ipcRenderer.sendSync("titlebtn:ismaximized"),
  minimize: () => ipcRenderer.invoke("titlebtn:minimize"),
  toggleMaximize: () => ipcRenderer.invoke("titlebtn:togglemaximize"),
  close: () => ipcRenderer.invoke("titlebtn:close"),
});
