/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

import {
  serial as polyfill, SerialPort as SerialPortPolyfill,
} from 'web-serial-polyfill';

/**
 * Elements of the port selection dropdown extend HTMLOptionElement so that
 * they can reference the SerialPort they represent.
 */
declare class PortOption extends HTMLOptionElement {
  port: SerialPort | SerialPortPolyfill;
}

let connectButton: HTMLButtonElement;
let connectBubble: HTMLDivElement;
let writeFpgaButton: HTMLButtonElement;
let bitstreamInput: HTMLDivElement;

let portCounter = 1;
let port: SerialPort | SerialPortPolyfill | undefined;
let reader: ReadableStreamDefaultReader | ReadableStreamBYOBReader | undefined;

const urlParams = new URLSearchParams(window.location.search);
const usePolyfill = urlParams.has('polyfill');
const bufferSize = 8 * 65536; // 65.5kB

const term = new Terminal({
  scrollback: 0,
  theme: {
    background: '#242526',
    foreground: '#20C20E',
  },
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.loadAddon(new WebLinksAddon());

const encoder = new TextEncoder();

term.onData((data) => {
  if (port?.writable == null) {
    return;
  }

  const writer = port.writable.getWriter();
  writer.write(encoder.encode(data));
  writer.releaseLock();
});

/**
 * Adds the given port to the selection dropdown.
 *
 * @param {SerialPort} port the port to add
 * @return {PortOption}
 */
function addNewPort(port: SerialPort | SerialPortPolyfill): PortOption {
  const portOption = document.createElement('option') as PortOption;
  portOption.textContent = `Port ${portCounter++}`;
  portOption.port = port;
  return portOption;
}

/**
 * Resets the UI back to the disconnected state.
 */
function markDisconnected(): void {
  term.writeln('<DISCONNECTED>');
  port = undefined;
  if (connectBubble) {
    connectBubble.style.display = 'block';
  }
}

/**
 * Initiates a connection to the selected port.
 */
async function connectToPort(): Promise<void> {
  const serial = navigator.serial;
  // Filter for Nyan Keys keyboards
  const filters = [{usbVendorId: 0x0483, usbProductId: 0x52A4}];
  port = await serial.requestPort({filters});
  if (!port) {
    return;
  }

  const options = {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none' as ParityType,
    stopBits: 1,
    flowControl: 'none' as FlowControlType,
    bufferSize: bufferSize,
  };

  try {
    await port.open(options);
    term.clear();
    term.writeln('<CONNECTED>');
    connectButton.disabled = false;
    if (connectBubble) {
      connectBubble.style.display = 'none'; // Hide the connectBubble
    }
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      term.writeln(`<ERROR: ${e.message}>`);
    }
    markDisconnected();
    return;
  }

  while (port && port.readable) {
    try {
      try {
        reader = port.readable.getReader({mode: 'byob'});
      } catch {
        reader = port.readable.getReader();
      }

      let buffer = null;
      for (;;) {
        const {value, done} = await (async () => {
          if (reader instanceof ReadableStreamBYOBReader) {
            if (!buffer) {
              buffer = new ArrayBuffer(bufferSize);
            }
            const {value, done} =
                await reader.read(new Uint8Array(buffer, 0, bufferSize));
            buffer = value?.buffer;
            return {value, done};
          } else {
            return await reader.read();
          }
        })();

        if (value) {
          await new Promise<void>((resolve) => {
            term.write(value, resolve);
          });
        }
        if (done) {
          break;
        }
      }
    } catch (e) {
      console.error(e);
      await new Promise<void>((resolve) => {
        if (e instanceof Error) {
          term.writeln(`<ERROR: ${e.message}>`, resolve);
        }
      });
    } finally {
      if (reader) {
        reader.releaseLock();
        reader = undefined;
      }
    }
  }

  if (port) {
    try {
      await port.close();
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        term.writeln(`<ERROR: ${e.message}>`);
      }
    }

    markDisconnected();
  }
}

/**
 * Closes the currently active connection.
 */
async function disconnectFromPort(): Promise<void> {
  // Move |port| into a local variable so that connectToPort() doesn't try to
  // close it on exit.
  const localPort = port;
  port = undefined;

  if (reader) {
    await reader.cancel();
  }

  if (localPort) {
    try {
      await localPort.close();
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        term.writeln(`<ERROR: ${e.message}>`);
      }
    }
  }

  markDisconnected();
}

document.addEventListener('DOMContentLoaded', async () => {
  const terminalElement = document.getElementById('terminal');

  if (terminalElement) {
    term.open(terminalElement);
    fitAddon.fit();
    window.addEventListener('resize', () => {
      fitAddon.fit();
    });
  }
  // Click to connect Nyan Keys logo.
  connectBubble = document.getElementById('connectBubble') as HTMLDivElement;
  connectButton = document.getElementById('logoButton') as HTMLButtonElement;
  writeFpgaButton =
      document.getElementById('writeFpgaBitstream') as HTMLButtonElement;
  bitstreamInput =
      document.getElementById('bitstreamInput') as HTMLInputElement;

  writeFpgaButton.addEventListener('click', () => {
    if (!port) {
      console.warn('No port selected');
      return;
    }
    bitstreamInput.click();
  });

  bitstreamInput.addEventListener('change', async (event) => {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        if (port && port.writable) {
          try {
            const byteArray = new Uint8Array(reader.result as ArrayBuffer);
            const chunkSize = 128;
            const writer = port.writable.getWriter();
            const initialMessage = `write-bitstream ${byteArray.length}\r\n`;
            await writer.write(new TextEncoder().encode(initialMessage));
            await new Promise((resolve) => setTimeout(resolve, 1000));
            for (let i = 0; i < byteArray.length; i += chunkSize) {
              const chunk = byteArray.slice(i, i + chunkSize);
              await writer.write(chunk);
              await new Promise((resolve) => setTimeout(resolve, 10));
            }

            writer.releaseLock();
            console.log('File written to FPGA successfully.');
          } catch (e) {
            console.error(e);
            alert('Failed to write file to FPGA.');
          }
        }
      };

      reader.onerror = () => {
        console.error('Error reading the file');
        alert('Error reading the file');
      };

      reader.readAsArrayBuffer(file);
    }
  });

  connectButton.addEventListener('click', () => {
    if (port) {
      disconnectFromPort();
    } else {
      connectToPort();
    }
  });

  const serial = usePolyfill ? polyfill : navigator.serial;
  const ports: (SerialPort | SerialPortPolyfill)[] = await serial.getPorts();
  ports.forEach((port) => addNewPort(port));

  if (!usePolyfill) {
    navigator.serial.addEventListener('connect', () => {
      connectToPort();
    });
  }
});
