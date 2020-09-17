'use strict';

var client = undefined;
var priorityQueue = undefined;

let minPrio = 10000000;

exports.init = function(c)
{
    priorityQueue = new PriorityQueue();

    log("initialized");

    client = c;
	client.on('message', onMessageHandler);
}

function onMessageHandler(target, context, msg, self)
{
    // ignore messages from other bots
    if (self) return;

    const cleanMsg = msg.trim().toLowerCase().split();
    const commName = cleanMsg[0];
    const param1 = cleanMsg[1];

    switch (commName)
    {
        case '!joinqueue':
            enqueueUser(target, context);
            break;
        case '!leavequeue':
            removeUser(context);
            break;
        case '!currentqueue':
            client.say(target, priorityQueue.printQueue(param1));
            break;
        case '!clearqueue':
            priorityQueue.clearQueue();
            break;
    }
}

function enqueueUser(target, context)
{
    var name = context.username;
    var priority = minPrio;

    if (context['badges'] != null)
    {
        let badges = context['badges'];
        if (badges.hasOwnProperty('vip'))
            priority -= minPrio / 2;
        if (badges.hasOwnProperty('bits'))
            priority -= badges.bits;
        if (badges.hasOwnProperty('subscriber'))
            priority -= +context['badges'].subscriber;
        if (priority < 0)
            priority = 0;
    }

    priorityQueue.enqueue(name, priority);
    client.say(target, context.username + " has been added to the queue!");
}

function removeUser(context)
{
    var name = context.username;
    var priority = 1;

    if (context['badge-info'].hasOwnProperty('subscriber'))
        priority += +context['badge-info'].subscriber;

    priorityQueue.remove(name, priority);


    client.say(target, context.username + " has been removed from the queue!");
}

class QElement
{
    constructor(element, priority)
    {
        this.element = element;
        this.priority = priority;
    }

    equals(qElement)
    {
        if (qElement.element == this.element && qElement.priority == this.priority)
            return true;
        return false;
    }
}

class PriorityQueue
{
    constructor()
    {
        this.items = [];
    }

    enqueue(element, priority)
    {
        if (this.elementExists(element))
            return "Element already in queue";

        var qElement = new QElement(element, priority);
        var contain = false;

        for (var i = 0; i < this.items.length; i++)
        {
            if (this.items[i].priority > qElement.priority)
            {
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }

        if (!contain)
            this.items.push(qElement);

        log(element + " has been added to the queue with prio " + priority + "!");
    }

    dequeue()
    {
        if (this.isEmpty())
            return "Underflow";

        return this.items.shift();
    }

    remove(element, priority)
    {
        if (this.isEmpty())
            return "Underflow";

        var qElement = new QElement(element, priority);

        for (var i = 0; i < this.items.length; i++)
        {
            if (this.items[i].equals(qElement))
            {
                this.items.splice(i, 1);
                break;
            }

        }

        log(element + " has been removed from the queue!");
    }

    front()
    {
        if (this.isEmpty())
            return "No elements in queue";
        return this.items[0];
    }

    elementExists(element)
    {
        for (var i = 0; i < this.items.length; i++)
        {
            log("comparing " + this.items[i].element + " to " + element);
            if (this.items[i].element === element)
                return true;
        }
        return false;
    }

    isEmpty()
    {
        return this.items.length == 0;
    }

    printQueue(length)
    {
        if (length == undefined || length > this.items.length)
            length = this.items.length;

        var str = "";
        for (var i = 0; i < length; i++)
            str += this.items[i].element + " ";
        return str;
    }

    clearQueue()
    {
        this.items = [];
    }
}

function log(msg) {
	const pref = 'uph ~ ';
	console.log(pref + msg);
}

function logError(msg) {
	const pref = 'uph ~ ERROR: ';
	console.log(pref + msg);
}

function logFatal(msg) {
	const pref = 'uph ~ FATAL: ';
	console.log(pref + msg);
}
