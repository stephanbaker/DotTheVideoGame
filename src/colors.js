/*jshint esversion: 6 */
const Palette = {
    LightPink: 0xF3EAEA,
    DarkPink: 0xE2BDBD,
    Blue: 0x5DBEE0,
    Red: 0xC86B6B,
    Black: 0x000000,
    White: 0xFFFFFF,
    LightGray: 0xDDDDDD,
    DarkGray: 0x333333,
    Magenta: 0xFF00FF,
    Yellow: 0xFFFF00
};

const Colors = {
    Blue: Palette.Blue, 
    Red: Palette.Red, 
    Background: Palette.White,
    PrimaryText: Palette.DarkGray,
    Token: Palette.LightGray,
    SelectedToken: Palette.Magenta,
    HighlightedToken: Palette.Yellow,
    Lighting: Palette.White
};

exports.Colors = Colors;