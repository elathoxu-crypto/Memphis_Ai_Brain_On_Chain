#!/bin/bash
# MEMPHIS SYNC - Automatic heartbeat sync
# Usage: ./sync.sh [upload|download|status]

JWT_FILE="$HOME/.memphis/pinata-creds.json"
GATEWAY="https://gateway.pinata.cloud"
LAST_CID_FILE="$HOME/.memphis/last-sync-cid"

get_jwt() {
    cat "$JWT_FILE" | jq -r '.jwt'
}

upload_json() {
    local json="$1"
    local name="$2"
    
    curl -s -X POST "https://api.pinata.cloud/pinning/pinJSONToIPFS" \
        -H "Authorization: Bearer $(get_jwt)" \
        -H "Content-Type: application/json" \
        -d "{\"pinataContent\": $json, \"pinataMetadata\": {\"name\": \"$name\"}}" | \
        jq -r '.IpfsHash'
}

download_json() {
    local cid="$1"
    curl -s "$GATEWAY/ipfs/$cid"
}

list_pins() {
    curl -s "https://api.pinata.cloud/data/pinList?status=pinned" \
        -H "Authorization: Bearer $(get_jwt)" | \
        jq '.rows[] | {hash: .ipfs_pin_hash, date: .date_pinned, name: .metadata.name}'
}

status() {
    echo "=== MEMPHIS SYNC STATUS ==="
    echo "Gateway: $GATEWAY"
    echo "Last sync CID: $(cat $LAST_CID_FILE 2>/dev/null || echo 'none')"
    echo ""
    echo "Recent pins:"
    list_pins | head -20
}

case "$1" in
    upload)
        json="$2"
        name="${3:-manual_$(date +%s)}"
        cid=$(upload_json "$json" "$name")
        echo "CID: $cid"
        echo "$cid" > "$LAST_CID_FILE"
        ;;
    download)
        cid="$2"
        download_json "$cid"
        ;;
    list)
        list_pins
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {upload|download|list|status} [args]"
        ;;
esac
