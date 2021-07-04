# osu! ZIP

osu! ZIP is a simple website where you can create and download ZIP files containing osu! beatmaps inputted by you.\
Basically a beatmap pack maker.\
I mainly made this as an alternative way of creating beatmap packs for tournament mappools.\
Beatmap source: [Sayobot](https://osu.sayobot.cn/)

# How to use it

To download your beatmap packs you're gonna need to input the following. 

### List of beatmaps

This is the first input field.\
You can list your beatmaps by either providing the beatmap set ID or the full beatmap set URL.

Example:
```                           
full URL: https://osu.ppy.sh/beatmapsets/742961#osu/1816113

Beatmap set ID is: 742961
```
For whatever option you prefer, each map must be separated by a comma and a space.

Example:
```
https://osu.ppy.sh/beatmapsets/742961#osu/1816113, https://osu.ppy.sh/beatmapsets/410162#osu/890190
```
Or
```
742961, 410162
```
Not doing this may result in an error while attempting to fetch data.

### Zip File Name

This is the second input field.\
This input is optional, it's the name that you want to give the ZIP file containing the beatmaps. If you're input was `My Beatmaps` then the ZIP file will be named `My Beatmaps.zip`.\
If no input is provided it will save as `Mappack.zip` by default.

### Video

This is the checkmark box below the two input fields.\
Unchecked by default.\
If it's checked, it will download the beatmaps with their respective videos if they have one, keep in mind that this will lead to a lot larger files.\
If it remains unchecked, it will download the beatmaps with no video.