from flask import Flask, request, jsonify
from flask_cors import CORS
import ipaddress
import math

app = Flask(__name__)
CORS(app)


def validate_ip(ip):
    if not ip:
        return False

    parts = ip.split(".")
    if len(parts) != 4:
        return False

    for part in parts:
        if not part.isdigit():
            return False

        number = int(part)
        if number < 0 or number > 255:
            return False

        if len(part) > 1 and part[0] == "0":
            return False

    return True


def validate_cidr(cidr):
    if not cidr:
        return False

    if "/" not in cidr:
        return False

    parts = cidr.split("/")
    if len(parts) != 2:
        return False

    ip_part = parts[0]
    prefix_part = parts[1]

    if not validate_ip(ip_part):
        return False

    if not prefix_part.isdigit():
        return False

    prefix = int(prefix_part)
    if prefix < 0 or prefix > 32:
        return False

    return True


def get_ip_info(ip):
    ip_obj = ipaddress.IPv4Address(ip)
    first_octet = int(ip.split('.')[0])

    if first_octet == 0:
        ip_class = "Special (This Network)"
    elif first_octet == 127:
        ip_class = "Loopback"
    elif 1 <= first_octet <= 126:
        ip_class = "Class A"
    elif 128 <= first_octet <= 191:
        ip_class = "Class B"
    elif 192 <= first_octet <= 223:
        ip_class = "Class C"
    elif 224 <= first_octet <= 239:
        ip_class = "Class D (Multicast)"
    else:
        ip_class = "Class E (Reserved)"

    if ip == "0.0.0.0":
        ip_type = "Special (Unspecified)"
    elif ip == "255.255.255.255":
        ip_type = "Broadcast"
    elif ip_obj.is_loopback:
        ip_type = "Loopback"
    elif ip_obj.is_multicast:
        ip_type = "Multicast"
    elif ip_obj.is_link_local:
        ip_type = "Link-Local"
    elif ip_obj.is_private:
        ip_type = "Private"
    else:
        ip_type = "Public"

    return {
        "valid": True,
        "class": ip_class,
        "type": ip_type
    }


@app.route("/validate", methods=["POST"])
def validate():
    data = request.json
    ip = data.get("ip")

    if not validate_ip(ip):
        return jsonify({"valid": False})

    info = get_ip_info(ip)
    return jsonify(info)


@app.route("/cidr", methods=["POST"])
def cidr():
    data = request.json
    ip_cidr = data.get("ip")

    if not validate_cidr(ip_cidr):
        return jsonify({"error": "Invalid CIDR format"}), 400

    try:
        network = ipaddress.ip_network(ip_cidr, strict=False)
        total_hosts = network.num_addresses

        if network.prefixlen == 32:
            usable_hosts = 1
            first_host = str(network.network_address)
            last_host = str(network.network_address)

        elif network.prefixlen == 31:
            usable_hosts = 2
            first_host = str(network.network_address)
            last_host = str(network.broadcast_address)

        else:
            usable_hosts = total_hosts - 2
            first_host = str(network.network_address + 1)
            last_host = str(network.broadcast_address - 1)

        result = {
            "subnet_mask": str(network.netmask),
            "network_address": str(network.network_address),
            "broadcast_address": str(network.broadcast_address),
            "first_host": first_host,
            "last_host": last_host,
            "usable_hosts": usable_hosts,
        }

        return jsonify(result)

    except ValueError:
        return jsonify({"error": "Invalid CIDR format"}), 400


@app.route("/compare", methods=["POST"])
def compare():
    data = request.json
    ip1 = data.get("ip1")
    ip2 = data.get("ip2")

    if not validate_cidr(ip1) or not validate_cidr(ip2):
        return jsonify({"error": "Both inputs must be valid CIDR"}), 400

    net1 = ipaddress.ip_network(ip1, strict=False)
    net2 = ipaddress.ip_network(ip2, strict=False)

    if net1 == net2:
        relation = "equal"
    elif net1.supernet_of(net2):
        relation = "network_1_contains_network_2"
    elif net2.supernet_of(net1):
        relation = "network_2_contains_network_1"
    elif net1.overlaps(net2):
        relation = "overlapping"
    else:
        relation = "no_overlap"

    return jsonify({
        "relationship": relation
    })



@app.route("/hostcalc", methods=["POST"])
def host_calc():
    data = request.json

    try:
        required_hosts = int(data.get("hosts"))

        if required_hosts <= 0:
            return jsonify({"error": "Host number must be greater than 0"}), 400

        host_bits = math.ceil(math.log2(required_hosts + 2))
        prefix = 32 - host_bits
        usable_hosts = (2 ** host_bits) - 2

        return jsonify({
            "cidr": f"/{prefix}",
            "usable_hosts": usable_hosts
        })

    except:
        return jsonify({"error": "Invalid host number"}), 400


if __name__ == "__main__":
    app.run(debug=True)
