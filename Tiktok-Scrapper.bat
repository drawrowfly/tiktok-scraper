TITLE Tiktok-Scraper made easier by RuneDemomn
@ECHO off
Setlocal EnableDelayedExpansion
set scraper=%appdata%\npm\node_modules\tiktok-scraper\bin\cli.js

cls
:menu
cls
ECHO.
ECHO MAIN MENU
ECHO.
ECHO #1 = Scrape videos from username. Enter only username
ECHO #2 = Scrape videos from hashtag. Enter hashtag without #
ECHO #3 = Scrape posts from current trends
ECHO #4 = Scrape posts from a music id number
ECHO #5 = Download single video without the watermark
ECHO #6 = View previous download history.
ECHO #7 = Version.
Echo x = exit
ECHO.
set choice=
set /p choice="Choice = "
ECHO.
for /f "usebackq delims=" %%I in (`powershell "\"!choice!\".toLower()"`) do set "choicelower=%%~I"
if '!choicelower!'=='1' goto user
if '!choicelower!'=='2' goto hashtag
if '!choicelower!'=='3' goto trend
if '!choicelower!'=='4' goto music
if '!choicelower!'=='5' goto video
if '!choicelower!'=='6' goto history
if '!choicelower!'=='7' goto version
if '!choicelower!'=='x' goto exit
ECHO "!choicelower!" is not valid, try again
TIMEOUT /t 5
goto menu

:user
cls
ECHO.
ECHO Scrape videos from username. Enter only the username EX: "Tiktok"
ECHO.
set username=
set /p username="Username = "
ECHO.
for /f "usebackq delims=" %%I in (`powershell "\"!username!\".toLower()"`) do set "usernamelower=%%~I"
node !scraper! user !usernamelower! --store --download --asyncDownload 5 --timeout 3000 --filepath %cd%\Tiktok-scraper\Users
ECHO.
ECHO scraper finished.
ECHO.
pause>nul|(echo Press any key to return to MAIN MENU...)
goto menu


:hashtag
cls
ECHO.
ECHO Scrape videos from hashtag. Enter hashtag without # EX: "Canada"
ECHO.
set hashtag=
set /p hashtag="hashtag = "
ECHO.
for /f "usebackq delims=" %%I in (`powershell "\"!hashtag!\".toLower()"`) do set "hashtaglower=%%~I"
node !scraper! hashtag !hashtaglower! --store --download --asyncDownload 5 --timeout 3000 --filepath %cd%\Tiktok-scraper\Hashtag
ECHO.
ECHO scraper finished.
ECHO.
pause>nul|(echo Press any key to return to MAIN MENU...)
goto menu


:trend
cls
ECHO.
ECHO Scraping posts from current trends...
ECHO.
ode !scraper! trend --store --download --asyncDownload 5 --timeout 3000 --filepath %cd%\Tiktok-scraper\Trends
ECHO.
ECHO scraper finished.
ECHO.
pause>nul|(echo Press any key to return to MAIN MENU...)
goto menu


:music
cls
ECHO.
ECHO Scrape posts from a music id number EX: "1552945659138"
ECHO.
set music=
set /p music="Music ID = "
ECHO.
node !scraper! music !music! --store --download --asyncDownload 5 --timeout 3000 --filepath %cd%\Tiktok-scraper\Music
ECHO.
ECHO scraper finished.
ECHO.
pause>nul|(echo Press any key to return to MAIN MENU...)
goto menu

:video
cls
ECHO.
ECHO Download a single video from a URL. EX: "https://www.tiktok.com/@tiktok/video/6807491984882765062"
ECHO.
set video=
set /p video="Url = "
ECHO.
node !scraper! video !video! --store --download --asyncDownload 5 --timeout 3000 --filepath %cd%\Tiktok-scraper\Videos
ECHO.
ECHO scraper finished.
ECHO.
pause>nul|(echo Press any key to return to MAIN MENU...)
goto menu


:history
cls
ECHO.
ECHO Displaying previous download history...
ECHO.
node !scraper! history
ECHO.
ECHO **Useful for profiles that wont download. The scraper logs all the videos before it downloads, so if it somehow failed to download videos the next time it menus up it wont download anything thinking it already has.**
ECHO.
ECHO Would you like to clear your history? 
ECHO.
set history=
set /p history="y/n = "
ECHO.
if '!history!'=='y' (
	set historytype=
	set /p historytype="Type = "
	ECHO.
	for /f "usebackq delims=" %%I in (`powershell "\"!historytype!\".toLower()"`) do set "historytypelower=%%~I"
	if '!historytypelower!'=='user' (
		set historyusername=
		set /p historyusername="Username = "
		node !scraper! history -r user:!historyusername!
		pause>nul|(echo Press any key to return to MAIN MENU...)
		goto menu
	)
	if '!historytypelower!'=='hashtag' (
		set historyhashtag=
		set /p historyhashtag="Hashtag = "
		node !scraper! history -r hashtag:!historyhashtag!
		pause>nul|(echo Press any key to return to MAIN MENU...)
		goto menu
	)
	if '!historytypelower!'=='trend' (
		set historytrend=
		set /p historytrend="Trend = "
		node !scraper! history -r trend:!historytrend!
		pause>nul|(echo Press any key to return to MAIN MENU...)
		goto menu
	)
	if '!historytypelower!'=='music' (
		set historymusic=
		set /p historymusic="MusicID = "
		node !scraper! history -r music:!historymusic!
		pause>nul|(echo Press any key to return to MAIN MENU...)
		goto menu
	)
	if '!historytypelower!'=='video' (
		set historyvideo=
		set /p historyvideo="VideoID = "
		node !scraper! history -r video:!historyvideo!
		pause>nul|(echo Press any key to return to MAIN MENU...)
		goto menu
	)
	ECHO "!historytypelower!" is not valid, try again. *dont use capitals*
	TIMEOUT /t 5
	goto history
)
if '!history!'=='n' (
	ECHO.
	pause>nul|(echo Press any key to return to MAIN MENU...)
	goto menu
)

ECHO "!history!" is not valid, try again
TIMEOUT /t 5
goto history


:version
cls
ECHO.
ECHO Tiktok-Scraper verion #:
ECHO.
node !scraper! --version
ECHO.
pause>nul|(echo Press any key to return to MAIN MENU...)
goto menu


:exit
exit