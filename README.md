# Webgesteuertes Legofahrzeug

## Abstract

In diesem Projekt ging es darum, ein Lego-Fahrzeug über eine Website fernzusteuern. Die Website wird von einem Raspberry Pi gehostet. Serverseitig wurden die Frameworks Node.js und rpio verwendet, clientseitig wurde auf Frameworks verzichtet.

![Ergebnissbild](/src/client/img/ergebnis.jpg)

## Aufbau

Das Projekt wurde in ein existierendes Lego-Model eingebaut, nämlich dem Lego Technik Volvo Radlader (42030). Dieser ist original schon ferngesteuert deshalb war, die Lego-Mechanik schon vorhanden. Die orginal Fernsteuerung funktioniert mit Infrarot, die alten Empfängermodule wurden entfernt und die Legoverbindungskabel aufgeschnitten.Auf einem experimentier Steckbrett wurden H-Brücken IC's so beschalten, dass mit jeweils 2 Logik Signalen der Stromfluss durch ein Motor drei stufig gesteuert werden kann (vorwärts, rückwärts, wedernoch). Der Raspberry Pi, der das zentrale Element darstellt, wurde auf das Steckbrett hinauf montiert. Der Raspberry Pi empfängt die JSON Pakets von der Website und steuert die Hardware an. Die Website ermöglicht, das Steuern des Fahrzeug. Sie befüllt die JSON's in abhängigkeit der Steuerelemente, Startknopf, Steuerhebel zum Bewegen der Schaufel, Steuerrad, Pedale und Gangwahl.

## Hardware Funktionalitäten

Die Hauptfunktionalität ist das Fahren das Fahrzeug kann vor und zurück fahren und beidseitig einlenken. Beide Funktionen sind leider einstufig, d.h. Vollgas oder kein gas, voll Einschlag oder kein Einschlag. Der Antriebsmotor liesse sich problemlos mit PWM ansteuern, so könnte man verschiedene Leistungen erreichen. Da der Umfangprojekts aber sowieso schon eher zu gross war wurde darauf verzichtet. Dies stand jedoch nicht von Anfang an fest und es wurde Erweiterbarkeit Gedanken entwickelt. Die Lenkung ist auch binär, dies ist vor allem dem Lego Servomotor geschuldet dieser dreht eine Lego Achse auf -90 0 oder 90 Grad. Weiter gibt es die beiden Schaufelbewegungen, Schaufelheben und Schaufeldrehen. Die Ansteuerung ist analog zum Antriebsmotor. Um eine zurückspeisen von Informationen zu realisieren, wurde ein Drehencodepoti angebracht über dieses kann man das Steuerrad auf der Website bewegen. Die entwickelte Plattform öffnet Tür und Tor für Erweiterungen, die jetzt relativ einfach hinzugefügt werden können. Als Beispiel Gimmick ein Piezolautsprecher, auf Knopfdruck beim Drehencoder “hupt” er.

![Website screenshot](/src/client/img/website_screenshot.png)

## Website

Die Elemente auf der Website sollten relativ selbst erklären sein, mit ihnen kann das Lego Fahrzeug gesteuert werden. Die Website sollte ursprünglich das Interieur eines handgeschaltenen BMW nachbilden, mehr dazu im Teil verlorenes Feature Handschaltung. Die Website verarbeitet die User Inputs und sendet sie an den Raspberry Pi, dieser schickt die Drehbewegungen des Drehencoders als Antwort zurück. Die Kommunikation ist sehr praktikabel gehalten es gibt nur dieses eine Verbindung, die in einem gewissen Intervall hin und her gesendet wird. Es wurde von Grund auf alles selbst aufgebaut auch die Symbole wurden alle, bis auf das wlan Symbol selbst erstellt, da die fremdgefertigten alternativen nicht komplett den Vorstellungen entsprachen. Zur Steuerung wird viel auf die Tastatur zurückgegriffen mehrere Bedienelement gleichzeitig bedienbar sein sollen und ein Herumklicken mit der Maus als nervig erachtet wurde.

## Verlorenes Feature Handschaltung

Währendes Projekt Werdeganges war es lange nicht klar ob die Hardware eine ansehnliche Funktion zustande bringen würde. Deshalb wurde ins Auge gefasst sich auf eine Fahrzeug Modellierung auf der Website zu konzentrieren und möglichst das Gefühl eines Autos nachzubilden. Daher kommt das nun eher überflüssige feature der Handschaltung. Es sollte eine Motordrehzahl simuliert werden, die sich einigermassen real zu den User Inputs verhält. Bei Druck auf das Gaspedal wird Wurzelförmiges eine Maximal Geschwindigkeit/Drehzahl angestrebt. Das Verhältnis von Drehzahl und Geschwindigkeit kann über die Gänge verändert werden. Bei einem hochschalten rapides heruntersetzen der Drehzahl, Erhöhung der Angestrebten Geschwindigkeit, erneutes hochdrehen der Drehzahl. So entsteht das klassische der Klassische Drehzahl Verlauf eines Beschleunigenden Autos. Weiter war geplant Motorengeräusche mit der entsprechenden Frequenz abzuspielen, dies stellte sich als eine zu grosse Herausforderung heraus, es wurde dann auf ein Sinus Generator zurückgegriffen, der eine Frequenz in Anhängigkeit der Drehzahl abspielte. Die hier beschriebenen Teile funktionierten tatsächlich in früheren Versionen der Software, wurden aber nicht ausgearbeitet und verloren an Bedeutung als eine Funktionierende Hardware in Reichweite lag. Eine Kombination, also ein realistisch handgschaltener Lego Radlader mit Soundmodelierung wäre durchaus möglich benötigt aber mehr Entwicklungszeit.

## Starten

- USB anschliesen
- Lego Batterie anschalten
- Wenn Blaue LED blinkt läuft der Server
- In Wlan einloggen
- Website aufrufen
- Verbindungsknopf drücken. Grün -> Verbunden, Rot -> Problem
- Start Engine Button nicht vergessen
