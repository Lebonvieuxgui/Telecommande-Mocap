#!/usr/bin/python
__author__ = "Support <support@aja.com>"
__version__ = "rc1"
__date__ = "Tue Mar 13 14:17:51 PDT 2012"
__copyright__ = "Copyright (C) 2009 AJA Video Systems, Inc."
__license__ = "Proprietary"

import sys
import threading
import urllib
import urllib2
import json
import re  # "now you have two problems" -- jwz


class UnsupportedFirmwareVersionError(BaseException):
    """ Raised if the target unit is running unsupported firmware. """

    def __str__(self):
        return "Unsupported firmware version."


class UnresponsiveTargetError(BaseException):
    """ Raised if the target unit fails to respond. (Is it powered-up?) """

    def __str__(self):
        return "Target device failed to respond."


class BaseClient:
    __author__ = "Support <support@aja.com>"
    __version__ = "$Revision: 49 $"
    __date__ = "$Date: 2012-11-27 16:24:56 -0800 (Tue, 27 Nov 2012) $"
    __copyright__ = "Copyright (C) 2009 AJA Video Systems, Inc."
    __license__ = "Proprietary"
    __doc__ = """
This class understands the kipro REST api.
Quickstart:

$ python
>>> from aja.embedded.rest.kipro import *
>>> client = Client('http://YourKiPro')
>>> client.getFirmwareVersion()
'4.0.0.14'
>>> client.record()
>>> client.play()
>>> client.getWriteableParameters()
"""
    __success = 200

    def __init__(self, url, supportedFirmwareVersion, versionParam, cacheRawParameters=True):
        self.url = url
        self.version_param = versionParam
        try:
            self.firmwareVersion = self.__getFirmwareVersion(versionParam)
        except IOError as e:
            print "IOError trying to communicate with target in BaseClient constructor"
            print e
            raise UnresponsiveTargetError
        except Exception as e:
            print "Error trying to communicate with target in BaseClient constructor"
            print e
            raise UnresponsiveTargetError

        if self.firmwareVersion < self.encodeVersion(supportedFirmwareVersion):
            print("Version must be at least " + supportedFirmwareVersion +
                  "; your version is " + self.decodeVersion(self.firmwareVersion))
            raise UnsupportedFirmwareVersionError(self.decodeVersion(
                self.firmwareVersion) + " < " + supportedFirmwareVersion)

        self.rawParametersCache = None
        if cacheRawParameters:
            self.getRawParameters()

    def __getFirmwareVersion(self, version_param):
        """
        Internal (private) call for getting current firmware version.
        Only used by  __init__.
        """
        version = 0
        (httpcode, response) = self.getParameter(version_param)
        if httpcode == self.__success:
            version = int(response)
        return version

    def setParameter(self, param_id, value):
        """ Set a single parameter value. """
        result = (None, "")
        f = None
        data = {
            'action': 'set',
            'paramid': param_id,
            'value': value,
        }
        noway = self.url + '/config?' + urllib.urlencode(data)
        try:
            f = urllib.urlopen(noway)
            result = (f.getcode(), f.read())
        except:
            raise
        else:
            f.close()
        return result

    def getRawParameter(self, param_id):
        """ Returns (http error code, a json string containing all the information about the param including its current value) """
        result = (None, "")
        f = None
        try:
            req = urllib2.Request(url=self.url + '/options?' + param_id)
            f = urllib2.urlopen(req, timeout=5)
            result = (f.getcode(), f.read())
            f.close()
        except urllib2.URLError as e:
            print("Error in getRawParameter()")
            print e
            raise UnresponsiveTargetError("There was an error: %r" % e)
        except:
            if f is not None:
                f.close()
            raise

        return result

    def getParameter(self, param_id):
        """
        Returns a 2-tuple: (the http error code, the value of the param_id
        - or an empty string if none or not found).
        """
        (code, response) = self.getRawParameter(param_id)
        result = (code, "")
        if code == self.__success:
            result = (code, (self.getSelected(response))['text'])
        return result

    def cleanResponse(self, response):
        """
        This deals with some historical peculiarities in Ki-Pro JSON formatting.
        """
        p = re.compile('([a-zA-Z_]+):')
        joined = "".join(response.splitlines())
        stripped = joined.strip(';')
        cleaned = p.sub(r'"\1":', stripped)
        return cleaned

    def asPython(self, response):
        """
        Convert a Ki-Pro response into a python object
        (usually an array of dictionaries depending on the json).
        """
        result = None
        try:
            result = json.loads(response)
        except:
            result = json.loads(self.cleanResponse(response))
        return result

    def getSelected(self, response):
        """
        The JSON returned is a list of all possible values for enum parameters with
        the current value marked as selected. Integer and string parameters
        are returned in the same way with just one entry in the list.
        Return the selected value entry in the list.
        """
        result = None
        options = self.asPython(response)
        for option in options:
            if "selected" in option:
                if option["selected"] == "true":
                    result = option
                    break
        return result

    def decodeVersion(self, versionBits):
        """
        The version is reported as a 32 bit integer.
        Returns a human readable version number decode this into four dotted octets.
        """
        version = "Error translating version bits"
        v = versionBits
        version = "%d.%d.%d.%d" % (
            (v & 0xFF000000) >> 24, (v & 0x00FF0000) >> 16, (v & 0x0000FF00) >> 8, v & 0x000000FF)
        return version

    def encodeVersion(self, versionString):
        """
        Converts a dotted string version number to an integer suitable for matching to
        the version number returned by the API.
        """
        version = 0
        elements = versionString.split('.')
        length = len(elements)
        if length > 0:
            version = int(elements[0]) << 24
        if length > 1:
            version += int(elements[1]) << 16
        if length > 2:
            version += int(elements[2]) << 8
        if length > 3:
            version += int(elements[3])
        return version

    def waitForConfigEvents(self, connectionid=None):
        """
        This is primarily used to get timecode.
        """
        events_stream = urllib2.urlopen(
            self.url + "/json?action=wait_for_config_events&configid=0&connectionid=%s" % connectionid, timeout=5)
        if (events_stream.getcode() == self.__success):
            events_json = events_stream.read()
            events = json.loads(events_json)
            return events
        return None

    def connect(self):
        """
        This is only used for listening for event streams (primarily timecode).
        """
        result = None
        connect_stream = urllib2.urlopen(
            self.url + "/json?action=connect&configid=0", timeout=5)
        if (connect_stream.getcode() == self.__success):
            connect_json = connect_stream.read()
            result = json.loads(connect_json)
        return result['connectionid']

    def getFirmwareVersion(self):
        """ Convenience method for getting the current firmware version. """
        return self.decodeVersion(self.firmwareVersion)

    def getRawParameters(self, cacheRawParameters=True):
        """
        Get everything the Ki-Pro knows about all parameters.
        This is list will be cached unless cacheRawParameters is set to false ("not recommended") so treat this
        as a stale list of available parameters and valid settings. Things that won't change at runtime.
        See getParameter() for current state of individual parameters.
        """
        rawParams = []
        if not self.rawParametersCache is None:
            rawParams = self.rawParametersCache
        else:
            response = []
            f = None
            try:
                # It can take longer than 5 seconds to get all of the Descriptors.
                f = urllib2.urlopen(
                    self.url + '/descriptors?paramid=*', timeout=30)
                response = (f.getcode(), f.read())
                f.close()
            except:
                if f is not None:
                    f.close()
                raise

            if response[0] == self.__success:
                try:
                    rawParams = self.asPython(response[1])
                    self.rawParametersCache = rawParams
                except:
                    print "Could not parse param list!"
                    raise
        return rawParams

    def getReadableParameters(self):
        """
        Get all parameters and their descriptions.
        This is list may be cached and so should be treated as stale.
        See getParameter() for current state
        """
        params = []
        rawParams = self.getRawParameters()
        filteredParams = []
        for param in rawParams:
            param_id = param['param_id']
            description = "description missing"
            attributes = param['string_attributes']
            for attribute in attributes:
                if 'name' in attribute and attribute['name'] == 'description':
                    description = attribute['value']
                    break
            params.append({param_id: description})
        return params

    def getWriteableParameters(self):
        """
        Returns a list of dictionaries containing all of the params which are available for writing.
        The key value is the param_id used for requests and the value is the description if any.
        This is list may be cached and so should be treated as stale.
        See getParameter() for current state
        """
        params = []
        rawParams = self.getRawParameters()

        filteredParams = []
        for param in rawParams:
            if not 'readonly' in param:
                filteredParams.append(param)

        for param in filteredParams:
            param_id = param['param_id']
            description = "description missing"
            attributes = param['string_attributes']
            for attribute in attributes:
                if 'name' in attribute and attribute['name'] == 'description':
                    description = attribute['value']
                    break
            params.append({param_id: description})
        return params

    def getValidSettingsForParameter(self, param_id):
        """
        Returns a list of
        """
        settings = []
        (code, response) = self.getRawParameter(param_id)
        if code == self.__success:
            stuff = self.asPython(response)
            for thing in stuff:
                settings.append((thing['value'], thing['text']))
        return settings

    def getSystemName(self):
        """ Returns the human readable-system name. """
        (code, response) = self.getParameter('eParamID_SysName')
        if code == self.__success:
            return response

    def is_alive(self):
        '''
        is_alive() will return True if the AJA device can be contacted.
        This function is useful for determining whether a device has completely booted.
        '''
        has_a_pulse = False
        try:
            # Ask for an arbitrary param value, and see if we get it.
            # Note: using getFirmwareVersion() doesn't work here, because it caches the value.
            (code, response) = self.getParameter(self.version_param)
            version_string = 'N/A'
            if (code == self.__success):
                version_string = response
                has_a_pulse = True
            else:
                print('Error code ' + code +
                      ' from getParameter(' + self.version_param + ')')
        except Exception as e:
            # print(e)   # This print is not always welcome...
            # sometimes (during reboot), an exception may be expected, and need not be printed to the console.
            pass
        finally:
            return has_a_pulse

    def getFreshFirmwareVersion(self):
        """ Goes back to the config to get the actual current firmware version.
            (Shows changed version number if Software Update has happened) """
        (code, response) = self.getParameter(self.version_param)
        version_string = 'N/A'
        if code == self.__success:
            freshFirmwareVersion = int(response)
            #print "freshFirmwareVersion = "
            #print hex(freshFirmwareVersion)

            versionString = self.decodeVersion(freshFirmwareVersion)

        return versionString


class Client(BaseClient):
    __author__ = "Support <support@aja.com>"
    __version__ = "$Revision: 44 $"
    __date__ = "$Date: 2012-11-06 13:34:08 -0800 (Tue, 06 Nov 2012) $"
    __copyright__ = "Copyright (C) 2009 AJA Video Systems, Inc."
    __license__ = "Proprietary"
    __doc__ = """
This class understands the kipro REST api.
Quickstart:

$ python
>>> from aja.embedded.rest.kipro import *
>>> client = Client('http://YourKiPro')
>>> client.getFirmwareVersion()
'4.0.0.9'
>>> client.record()
>>> client.play()
>>> client.getWriteableParameters()
"""
    __success = 200

    def __init__(self, url, cacheRawParameters=True):
        try:
            BaseClient.__init__(self,
                                url=url,
                                supportedFirmwareVersion="3.0.0",
                                versionParam="eParamID_SWVersion",
                                cacheRawParameters=cacheRawParameters)
        except UnsupportedFirmwareVersionError:
            print("UnsupportedFirmwareVersionError")
            raise UnsupportedFirmwareVersionError
        except UnresponsiveTargetError as e:
            print("UnresponsiveTargetError in kipro Client constructor")
            print e
            raise UnresponsiveTargetError
        except Exception as e:
            print("Error in Client constructor")
            print e
            raise UnresponsiveTargetError

    def getTimecodeWithSynchronousCall(self):
        """
        Get the current timecode value. Most aplications will want to connect() then run wait_for_config_events in a while()
        loop in its own thread. See TimecodeListener for a convenient way to do that.
        WARNING: This call can take a long time. It will not return until timecode changes or is updated with the same
        value (like when stop is pressed).
        """
        connection = self.connect()
        timecode = None
        done = False
        while not done:
            events = self.waitForConfigEvents(connection)
            for event in events:
                if (event["param_id"] == "eParamID_DisplayTimecode"):
                    timecode = event["str_value"]
                    done = True
                    break
        return timecode

    def getTransporterState(self):
        """
        Convenience method for getting the current transporter state.
        Returns (state_value, human_readable_string)
        """
        (httpcode, response) = self.getRawParameter("eParamID_TransportState")
        result = ("", "")
        if httpcode == self.__success:
            selected = self.getSelected(response)
            result = (int(selected['value']), selected['text'])
        return result

    def sendTransportCommandByDescription(self, term):
        """
        Compares term to the descriptions of valid transport commands sends that command if found.
        """
        settings = self.getValidSettingsForParameter(
            "eParamID_TransportCommand")
        recordValue = 0
        for (value, description) in settings:
            if term == description:
                recordValue = value
                break
        (httpcode, response) = self.setParameter(
            "eParamID_TransportCommand", recordValue)

        if httpcode == self.__success:
            selected = self.getSelected(response)

    def stop(self):
        """
        Stop a record or pause playback (send twice to stop playback)
        """
        self.sendTransportCommandByDescription('Stop Command')

    def record(self):
        """
        Convenience method to start the Transporter recording.
        """
        self.sendTransportCommandByDescription("Record Command")

    def play(self):
        """
        Convenience method to start playback.
        """
        self.sendTransportCommandByDescription("Play Command")

    def playReverse(self):
        """
        Convenience method to playback in reverse.
        """
        self.sendTransportCommandByDescription("Play Reverse Command")

    def nextClip(self):
        """
        Go to the next clip in the current playlist.
        """
        self.sendTransportCommandByDescription("Next Clip")

    def previousClip(self):
        """
        Go to the previous clip in the current playlist.
        """
        self.sendTransportCommandByDescription("Previous Clip")

    def fastForward(self):
        """
        Advance quickly while playing.
        """
        self.sendTransportCommandByDescription("Fast Forward")

    def fastReverse(self):
        """
        Playing in reverse quickly.
        """
        self.sendTransportCommandByDescription("Fast Reverse")

    def singleStepForward(self):
        """
        Move one frame forward.
        """
        self.sendTransportCommandByDescription("Single Step Forward")

    def singleStepReverse(self):
        """
        Move one frame backward.
        """
        self.sendTransportCommandByDescription("Single Step Reverse")

    def getPlaylists(self):
        """
        Get the current playlists.
        """
        code = 0
        response = ""
        f = None
        try:
            f = urllib2.urlopen(
                self.url + '/clips?action=get_playlists', timeout=5)
            (code, response) = (f.getcode(), f.read())
            f.close()
        except:
            if f is not None:
                f.close()
            raise

        playlists = []
        if code == self.__success:
            top = self.asPython(response)
            entries = top["playlists"]
            for entry in entries:
                playlists.append(entry['playlist'])

        return playlists

    def getCurrentClipName(self):
        """ Convenience method to get the current clip. """
        result = ""
        (code, response) = self.getParameter('eParamID_CurrentClip')
        if code == self.__success:
            result = response

        return result

    def goToClip(self, clipName):
        """ This selects a clip as the current clip."""
        self.setParameter('eParamID_GoToClip', clipName)

    def cueToTimecode(self, timecode):
        """
        Cue to the supplied timecode in the current clip.
        Warning: Wraps if you use a timecode beyond the end of the clip.
        """
        self.setParameter('eParamID_CueToTimecode', timecode)
        self.sendTransportCommandByDescription("Cue")


def usage():
    print"""Usage: ./kipro [options]
Options:
    --start
    --stop
    -u | --url(URL of Ki-Pro unit)
    -t | --takename
    -h | --help(this message)
Example: ./kipro --start --url='192.168.1.102' --takename='take001'"""


def demo(url, start, takename):
    """ Demonstrates how to use the client and grabs some useful information. """
    client = Client(url)

    if start is True and takename is not "":
        client.setParameter("eParamID_UseCustomClipName", 1)
        client.setParameter("eParamID_CustomClipName", takename)

    if start is True:
        client.record()
        print "kipro has started"
    else:
        client.stop()
        print "kipro has stopped"


def main(argv):
    try:
        opts, args = getopt.getopt(
            argv, "u:h:t", ["url=", "help", "start", "stop", "takename="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    url = None
    start = False
    stop = False
    takename = ""
    # defaults
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-u", "--url"):
            url = "http://" + arg
        elif opt in ("--start"):
            start = True
        elif opt in ("--stop"):
            stop = True
        elif opt in ("-t", "--takename"):
            takename = arg

    if url is None or start is stop or (takename == "" and start is True):
        usage()
        sys.exit()
    else:
        print url
        print start
        print takename
        demo(url, start, takename)


class TimecodeListener(threading.Thread):
    __author__ = "Support <support@aja.com>"
    __version__ = "$Revision: 44 $"
    __date__ = "$Date: 2012-11-06 13:34:08 -0800 (Tue, 06 Nov 2012) $"
    __copyright__ = "Copyright (C) 2009 AJA Video Systems, Inc."
    __license__ = "Proprietary"
    __doc__ = """
    This listener creates a connection to a ki-pro unit and listens for timecode event updates.
    WARNING: Timecode events may not occur every frame. If you need a frame accurate timecode, consider using
    RS422 or setting timecode as a record trigger.

    quickstart:

    python$
      >>> from aja.embedded.rest.kipro import *
      >>> l = TimecodeListener('http://YourKiPro')
      >>> l.start()
      >>> print l.getTimecode()
    """

    def __init__(self, url):
        """
        Create a TimecodeListener.
        Use start() to start it listening.
        """
        super(TimecodeListener, self).__init__()
        self.url = url
        self.__timecode = ""
        self.__stop = False
        self.__lock = threading.RLock()

    def run(self):
        c = Client(self.url)
        connection = c.connect()
        if connection:
            while not self.__stop:
                events = c.waitForConfigEvents(connection)
                for event in events:
                    if (event["param_id"] == "eParamID_DisplayTimecode"):
                        self.__setTimecode(event["str_value"])
                        break
            print "Listener stopping."
        else:
            print "Failed to connect to", self.url

    def stop(self):
        """ Tell the listener to stop listening and the thread to exit. """
        self.__stop = True

    def __setTimecode(self, timecode):
        """ Threadsafe. """
        with self.__lock:
            self.__timecode = timecode

    def getTimecode(self):
        """ Thread safe. """
        with self.__lock:
            return self.__timecode


if __name__ == "__main__":
    import getopt
    main(sys.argv[1:])
