#!/bin/bash

# GitHub Issues Bulk Creator for CarbonLedger
# Creates all 150 issues across the repository

set -e

REPO="milah-247/carbonledger"
ISSUES_FILE="generated-issues.json"
COUNTER=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not found. Please install it first:${NC}"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if issues file exists
if [ ! -f "$ISSUES_FILE" ]; then
    echo -e "${RED}❌ Issues file not found: $ISSUES_FILE${NC}"
    echo "   Run: node scripts/generate-150-issues.js"
    exit 1
fi

# Verify authentication
echo -e "${BLUE}🔐 Verifying GitHub authentication...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    echo "   Run: gh auth login"
    exit 1
fi
echo -e "${GREEN}✅ Authenticated${NC}\n"

# Count total issues
TOTAL=$(jq 'length' "$ISSUES_FILE")
echo -e "${BLUE}📊 Creating $TOTAL issues for repository: $REPO${NC}\n"

# Create issues from JSON
jq -c '.[]' "$ISSUES_FILE" | while read -r issue; do
    COUNTER=$((COUNTER + 1))
    
    # Extract fields
    TITLE=$(echo "$issue" | jq -r '.title')
    BODY=$(echo "$issue" | jq -r '.body')
    LABELS=$(echo "$issue" | jq -r '.labels | join(",")')
    
    # Show progress
    echo -ne "${YELLOW}[${COUNTER}/${TOTAL}]${NC} Creating: ${TITLE:0:50}..."
    
    # Create issue
    if gh issue create \
        --repo "$REPO" \
        --title "$TITLE" \
        --body "$BODY" \
        --label "$LABELS" \
        2>/dev/null; then
        echo -e " ${GREEN}✅${NC}"
    else
        echo -e " ${RED}⚠️${NC}"
    fi
    
    # Rate limiting - wait 500ms between requests
    sleep 0.5
done

echo ""
echo -e "${GREEN}✅ Successfully created all $TOTAL issues!${NC}\n"
echo -e "${BLUE}📈 View all issues:${NC}"
echo "   gh issue list --repo $REPO --limit 500"
echo ""
echo -e "${BLUE}🏷️  Filter by label:${NC}"
echo "   gh issue list --repo $REPO --label \"smart-contracts\""
echo "   gh issue list --repo $REPO --label \"testing\""
echo "   gh issue list --repo $REPO --label \"frontend\""
echo "   gh issue list --repo $REPO --label \"backend\""
echo ""
