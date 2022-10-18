declare global {
  type LaunchState = "init" | "launching" | "ready" | "fail";

  interface ErarsAPI {
    launch: () => Promise<boolean>;
    getState: () => LaunchState;
    stdin: (input: string) => Promise<Error | null | undefined>;
    stdout: () => Promise<string>;
  }

  const Erars: ErarsAPI;
}

class ErarsBridge {
  constructor() {}

  launch() {
    return Erars.launch();
  }

  stdin(input: string) {
    return Erars.stdin(input);
  }
  stdout() {
    return Erars.stdout();
  }

  get state() {
    return Erars.getState();
  }
}

const singletonInstance = new ErarsBridge();
export default singletonInstance;
