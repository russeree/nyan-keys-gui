<div align="center">
 <img src="public/images/logo/icon_square.png" width="120" height="120">
</div>

<div align="center">
    <h1>NyanOS GUI 🐱 - A Web Serial API Interface</h1>
</div>

<div align="center">
The NyanOS GUI provides a browser-based interface for interacting with the Nyan Keys Keyboard and NyanOS (NOS) implementations. Designed for local use, it prioritizes privacy and operates as a Progressive Web Application (PWA), serving as a serial command relay and macro assistant.
</div>

# Features include 
 - Nyan Cat connection assistant
 - XTerm Javascript based serial terminal
 - Action buttons
   - Program FPGA Bitstream
   - Enable Bitcoin Mining

# Action Buttons
## Write FPGA Bitstream
This feature allows the uploading and reconfiguration of a Lattice FPGA bitstream for the primary FPGA of the Nyan Keys Keyboard. Bitstreams must be compressed using [`icecompr.py`](https://github.com/YosysHQ/icestorm/tree/master/icecompr), as shown in the following command:

```sh 
python3 icecompr.py < example_8k.bin > example_8k.compr
```

The Nyan Keys PCB's EEPROM is I2C-based with 1Mbit (131070 bytes) of storage. The uncompressed bitstream for the Lattice Ice40HX4k is slightly larger, requiring compression. The `icecompr` utility typically achieves compression ratios of 0.2 - 0.4, reducing the Ice40HX4k bitstream to approximately 26000 bytes. NyanOS currently does not support error checking or uncompressed bitstreams. 

Incorrectly uploading a file will not damage the Nyan Keys keyboard but will disable the FPGA, rendering the keyboard inoperative until the correct bitstream is restored. 

A known visual glitch displays the command `write-bitstream size XXXXX` multiple times during the bitstream writing process. This does not impact the successful writing of the bitstream to the non-volatile EEPROM memory. 

A SHA256 hash of the compressed bitstream is provided for verification against your uploaded file. Use `sha256sum <filename>` for comparison.

The source code and original release bitstreams, both compressed and uncompressed, are available at [https://github.com/russeree/nyan-keys-ice40hx4k-bitstream](https://github.com/russeree/nyan-keys-ice40hx4k-bitstream)

## Nyan Keys Terminal Access
Become the 'Shadowy Super Coder" - _Elizabeth Warren_ with the Nyan Keys keyboard's own operating system, NyanOS (NOS), featuring a functional serial USB CDC interface. Upon connecting via the Nyan-Gui, you'll be welcomed with a Message of the Day (MoTD) and a terminal cursor. The current implementation includes basic commands with a maximum buffer length of 128 characters:

 - `getinfo` - Displays keyboard and OS properties, including the owner.
 - `set-owner <name with spaces>` - Assigns your desired name to EEPROM, viewable with `getinfo`.
 - `write-bitstream <size>` - Uploads a bitstream file to the Nyan Keys EEPROM.

## Privacy

This application is served statically and is cached for offline use. No
analytics are collected. All communication with the serial device happens
locally.

## Building

This project is written in TypeScript and uses npm and Vite to manage
dependencies and automate the build process. To get started clone the
repository and install dependencies by running,

```sh
npm install
```

To create a production build in the `dist` folder run,

```sh
npm run build
```

To start a local development server run,

```sh
npm run dev
```
