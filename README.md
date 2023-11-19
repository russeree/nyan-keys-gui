<div align="center">
 <img src="public/images/logo/icon_square.png" width="120" height="120">
</div>

<br>

<div align="center">
    <h1>NyanOS GUI 🐱 - A Web Serial API Interface</h1>
</div>

<div align="center">
The NyanOS GUI provides a browser-based interface for interacting with the Nyan Keys Keyboard and NyanOS (NOS) implementations. Designed for local use, it prioritizes privacy and operates as a Progressive Web Application (PWA), serving as a serial command relay and macro assistant.
</div>

# Index

 - [Features](https://github.com/russeree/nyan-keys-gui#features-include)
 - [Terminal](https://github.com/russeree/nyan-keys-gui#bitcoin-solo-mining)
 - [Actions](https://github.com/russeree/nyan-keys-gui#action-buttons)
   - [Write FPGA Bitstream](https://github.com/russeree/nyan-keys-gui#write-fpga-bitstream)
   - [BitCoin Mining](https://github.com/russeree/nyan-keys-gui#bitcoin-solo-mining)

# Features include 
 - Nyan Cat connection assistant
 - XTerm Javascript based serial terminal
 - Action buttons
   - Program FPGA Bitstream
   - Enable Bitcoin Mining (Opt-In)

# Nyan Keys Terminal Access 💻 
Become the 'Shadowy Super Coder" - _Elizabeth Warren_ with the Nyan Keys keyboard's own operating system, NyanOS (NOS), featuring a functional serial USB CDC interface. Upon connecting via the Nyan-Gui, you'll be welcomed with a Message of the Day (MoTD) and a terminal cursor. The current implementation includes basic commands with a maximum buffer length of 128 characters:

 - `getinfo` - Displays keyboard and OS properties, including the owner.
 - `set-owner <name with spaces>` - Assigns your desired name to EEPROM, viewable with `getinfo`.
 - `write-bitstream <size>` - Uploads a bitstream file to the Nyan Keys EEPROM.

### ```getinfo```
Obtains current information about the Nyan Keys keyboard. Name, version, author, and build date are displayed

### ```set-owner [name1] [name2] ...```
Writes a name to the owner field in the Nyan Keys EEPROM, this transcends individual firmware flashes as the information is not stored on the STM32F723 MCU or the FPGA.

### ```write-bitstream [bytes]```
Writes an icecompr compressed FPGA bitstream to the second EEPROM bank. The max size ```[bytes]``` that is supported is 65536 bytes. Once the command is executed all serial data passed though the CDC channel is written directly to memory. Once the number of bytes have been transmitted over the CDC channel NyanOS will return to ```command mode``` to accept new commands. A sha256 hash of the data written to memory is printed to the terminal. 


# Action Buttons 🏃
## Write FPGA Bitstream
This feature allows the uploading and reconfiguration of a Lattice FPGA bitstream for the primary FPGA of the Nyan Keys Keyboard. Bitstreams must be compressed using [`icecompr.py`](https://github.com/YosysHQ/icestorm/tree/master/icecompr), as shown in the following command:

```sh 
python3 icecompr.py < example_8k.bin > example_8k.compr
```

The Nyan Keys PCB's EEPROM is I2C-based with 1Mbit (131070 bytes) of storage. The uncompressed bitstream for the Lattice Ice40HX4k is slightly larger, requiring compression. The `icecompr` utility typically achieves compression ratios of 0.2 - 0.4, reducing the Ice40HX4k bitstream to approximately 26000 bytes. NyanOS currently does not support error checking or uncompressed bitstreams. 

Incorrectly uploading a file will not damage the Nyan Keys keyboard but will disable the FPGA, rendering the keyboard inoperative until the correct bitstream is restored. 

There is a known visual glitch displays the command `write-bitstream size XXXXX` multiple times during the bitstream writing process. This does not impact the successful writing of the bitstream to the non-volatile EEPROM memory. 

A SHA256 hash of the compressed bitstream is provided for verification against your uploaded file. Use `sha256sum <filename>` for comparison.

The source code and original release bitstreams, both compressed and uncompressed, are available at [https://github.com/russeree/nyan-keys-ice40hx4k-bitstream](https://github.com/russeree/nyan-keys-ice40hx4k-bitstream)

## Bitcoin Solo Mining
As a Bitcoin Maximalist, I've developed a unique, opt-in Bitcoin miner integrated into both the UI and OS. Out of the box this is inactive and would require additional configuration. Given that this Bitcoin miner operates in the Kh/s range, it's statistically improbable to find a Bitcoin block, especially compared to the current network hashrate, which is in the hundreds of Ex/s. None the less there were extra CPU cycles whilst the NyanOS isn't being interrupted to send over data to the host. 

To mine Bitcoin using NyanOS, two components are required:
 - A Bitcoin Node (Pruned is valid)
 - A Legacy Address (Payout Address)

In it's simplest form the ```btc_miner.js``` requests a block template from your node. The block template contains _nearly_ all of the information necessary to create the block sans the payout transaction. For the payout, you need to supply a P2PKH (Legacy) Bitcoin address to the Nyan GUI. If by the blessing of God your keyboard manages to find a block inside of the nonce range Bitcoins will sent to that address. The payout automatically will adjust to the block subsidy based on the block height (currently 6.25BTC in 2023) and you the user will receive the full amount since there is no pool. 

**Note**: For simplicity, the logic to include additional transactions in your block hasn't been incorporated. The block contents will be a single coinbase transaction to the address you provide.

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
