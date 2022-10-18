import { ipcMain, dialog } from "electron";
import { platform, cwd, env } from "node:process";
import child_process from "node:child_process";
import { Bridge } from "./bridge";

class ErarsBridge implements Bridge {
  path?: string;
  process?: child_process.ChildProcess;
  state: "init" | "launching" | "ready" | "fail";

  constructor() {
    this.state = "init";
  }

  private get executable() {
    if (platform === "win32") return "executables/erars-stdio.exe";
    return "executables/erars-stdio";
  }

  async setupPath() {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "dontAddToRecent"],
    });

    if (result.canceled) throw new Error("Dialog closed");
    [this.path] = result.filePaths;
  }

  init() {
    ipcMain.on("erars:getState", (event) => {
      event.returnValue = this.state;
    });

    ipcMain.handle("erars:launch", async () => {
      if (this.state === "launching") {
        return false;
      }

      this.state = "launching";
      try {
        await this.setupPath();

        this.process = child_process.spawn(
          this.executable,
          [this.path ?? "", "--json"].concat(
            env.mode === "DEV" ? [`--log-level=trace`] : []
          ),
          {
            cwd: cwd(),
            windowsHide: true,
          }
        );

        this.process.stdout?.setEncoding("utf8");
        this.process.stderr?.setEncoding("utf8");

        this.state = "ready";
        return true;
      } catch (err) {
        this.state = "fail";
        return false;
      }
    });

    ipcMain.handle("erars:stdin", (_, input: string) => {
      return new Promise((resolve, reject) => {
        this.process?.stdin?.write(input, (err) => {
          if (!err) resolve(err);
          reject(err);
        });
      });
    });

    ipcMain.handle("erars:stdout", () => {
      return new Promise((resolve) => {
        this.process?.stdout?.once("data", (chunk: string) => {
          resolve(chunk);
        });
      });
    });
  }
}

const singletonInstance = new ErarsBridge();
export default singletonInstance;
