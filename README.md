
<div align="center">
  ![Hello](https://github.com/russeree/nyan-keys-gui/blob/main/public/images/logo/icon_square.png?raw=true)
</div>

# NyanOS GUI 🐱 - A Web Serial API Interface
Browser based method to interact with the Nyan Keys Keyboard and/or NyanOS (NOS) implementation. Designed to be run locally as to preserve privacy. This A PWA (Progressive Web Application) that acts as a serial command relay and macro assistant. Features include 
 - Nyan Cat connection assistant
 - XTerm Javascript based serial terminal
 - Action buttons
   - Program FPGA Bitstream
   - Enable Bitcoin Mining

# Action Buttons
## Write FPGA Bitstream
Allows you to upload and reconfigure a Lattice fpga bitstream for the primary FPGA of the Nyan Keys Keyboard. Bitstreams must be compressed using the [`icecompr.py`](https://github.com/YosysHQ/icestorm/tree/master/icecompr) using the following command on your .bin bitstream.

```sh 
python3 icecompr.py < example_8k.bin > example_8k.compr
```

The current EEPROM installed to the Nyan Keys PCB is i2c based and supports 1Mbit (131070 bytes) of storage which is just shy of 135100 bytes needed to store the uncompressed bitstream for the Lattice Ice40HX4k. Using icecompr allowed for compression ratios of .2 - .4 resulting in a compressed bitstream size of approx ~26000 bytes for the same Ice40HX4k bitstream. NyanOS doesn't support any forms of error checking currently and or the use of uncompressed bitstreams. 

Uploading the wrong file will not result in a hardware failure of the Nyan Keys keyboard but will cause the FPGA to stop functioning and as such keyboard input will be lost until the original bitstream is flashed back to the keyboard. 

There is a visual bug currently where upon beginning the writing of a bitstream the command ```write-bitstream size XXXXX``` will be displayed multiple times. This does not have any effect on the ability and success of a bitstream write to the non-volatile EEPROM memory. 

A SHA256 hash of the compressed bitstream is presented and can be used to compare against your compressed bitstream file that you uploaded. ```sha256sum <filename>```

Source code and original release uncompressed and compressed bitstreams can be found at https://github.com/russeree/nyan-keys-ice40hx4k-bitstream


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
