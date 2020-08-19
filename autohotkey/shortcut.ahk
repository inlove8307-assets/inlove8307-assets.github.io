#NoEnv
SetBatchLines, -1

#Include, %A_LineFile%\..\Chrome.ahk\Chrome.ahk

page := Chrome.GetPage()

MsgBox, % IsObject(page)