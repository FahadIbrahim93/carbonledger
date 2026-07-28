#!/bin/bash
# prepare-contract-repo.sh
# Prepares contract files for the separate carbonledger-contract repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEMP_DIR="/tmp/carbonledger-contract-prep-$$"
REPO_NAME="carbonledger-contract"
GITHUB_ORG="Carbon-Ledger-stellar"

echo "================================================"
echo "CarbonLedger Contract Repository Preparation"
echo "================================================"
echo ""

# Step 1: Clone or update the contract repository
echo "📦 Step 1: Cloning contract repository..."
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi
mkdir -p "$TEMP_DIR"

git clone "https://github.com/${GITHUB_ORG}/${REPO_NAME}.git" "$TEMP_DIR/$REPO_NAME" 2>&1 || {
    echo "❌ Failed to clone $REPO_NAME"
    exit 1
}

echo "✅ Repository cloned to $TEMP_DIR/$REPO_NAME"
echo ""

# Step 2: Copy contract files
echo "📁 Step 2: Copying contract files..."
cp "$PROJECT_ROOT/contracts/Cargo.toml" "$TEMP_DIR/$REPO_NAME/"
cp -r "$PROJECT_ROOT/contracts/carbon_"* "$TEMP_DIR/$REPO_NAME/"

echo "✅ Contract files copied"
echo ""

# Step 3: Copy documentation
echo "📚 Step 3: Copying documentation..."
cp "$PROJECT_ROOT/contracts/README.md" "$TEMP_DIR/$REPO_NAME/"
cp "$PROJECT_ROOT/contracts/DEPLOYMENT.md" "$TEMP_DIR/$REPO_NAME/"
cp "$PROJECT_ROOT/contracts/QUICKSTART.md" "$TEMP_DIR/$REPO_NAME/"

echo "✅ Documentation copied"
echo ""

# Step 4: Copy GitHub workflows
echo "⚙️  Step 4: Setting up GitHub Actions..."
mkdir -p "$TEMP_DIR/$REPO_NAME/.github/workflows"
cp "$PROJECT_ROOT/.github/workflows/contracts.yml" "$TEMP_DIR/$REPO_NAME/.github/workflows/"

echo "✅ GitHub Actions workflows configured"
echo ""

# Step 5: Create .gitignore if it doesn't exist
echo "🔒 Step 5: Configuring git..."
if [ ! -f "$TEMP_DIR/$REPO_NAME/.gitignore" ]; then
    cat > "$TEMP_DIR/$REPO_NAME/.gitignore" << 'EOF'
# Rust
/target/
Cargo.lock
**/*.rs.bk
*.pdb

# WASM
*.wasm

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.local
.env.*.local

# Build artifacts
*.o
*.so
*.dylib
EOF
fi

echo "✅ Git configuration added"
echo ""

# Step 6: Create LICENSE if it doesn't exist
if [ ! -f "$TEMP_DIR/$REPO_NAME/LICENSE" ]; then
    echo "📜 Step 6: Adding Apache 2.0 License..."
    cat > "$TEMP_DIR/$REPO_NAME/LICENSE" << 'EOF'
                              Apache License
                        Version 2.0, January 2004
                     http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   "License" shall mean the terms and conditions for use, reproduction,
   and distribution as defined in Sections 1 through 9 of this document.

   "Licensor" shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   "Legal Entity" shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   "control" means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   "You" (or "Your") shall mean an individual or Legal Entity exercising
   permissions granted by this License.

   "Source" form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   "Object" form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   "Work" shall mean the work of authorship, whether in Source or Object
   form, made available under the License, as indicated by a copyright
   notice that is included in or attached to the work (an example is
   provided in the Appendix below).

   "Derivative Works" shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   "Contribution" shall mean any work of authorship, including
   the original Work and any Derivative Works thereof, submitted to,
   processed by, and released by Licensor for inclusion in the Work
   by the copyright owner or by an individual or Legal Entity authorized
   to submit on behalf of the copyright owner. For the purposes of this
   definition, "submitted" means any form of electronic, verbal, or
   written communication sent to the Licensor or its representatives,
   including but not limited to communication on electronic mailing lists,
   source code control systems, and issue tracking systems that are
   managed by, or on behalf of, Licensor for the purpose of discussing
   and improving the Work, but excluding communication that is
   conspicuously marked or otherwise designated in writing by the
   copyright owner as "Not a Contribution."

   "Contributor" shall mean Licensor and any Legal Entity on behalf of
   whom a Contribution has been received by Licensor and subsequently
   incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
       Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
       stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
       that You distribute, all copyright, patent, trademark, and
       attribution notices from the Source form of the Work,
       excluding those notices that do not pertain to any part of
       the Derivative Works; and

   (d) If the Work includes a "NOTICE" text file, then any
       Derivative Works that You distribute must include a readable
       copy of the attribution notices contained
       within such NOTICE file, excluding those notices that do not
       pertain to any part of the Derivative Works, in at least one
       of the following places: within a NOTICE text file distributed
       as part of the Derivative Works; within the Source form or
       documentation, if provided along with the Derivative Works; or,
       within a display generated by the Derivative Works, if and
       wherever such third-party notices normally appear. The contents
       of the NOTICE file are for informational purposes only and
       do not modify the License. You may add Your own attribution
       notices within Derivative Works that You distribute, alongside
       or as an addendum to the NOTICE from the Work, provided that
       such additional attribution notices cannot be construed as
       modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions of this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to Licensor shall be under the terms and conditions of
   this License, without additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contribution.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS
EOF
fi

echo "✅ License added"
echo ""

# Step 7: Verify structure
echo "🔍 Step 7: Verifying repository structure..."
cd "$TEMP_DIR/$REPO_NAME"

echo ""
echo "Repository contents:"
find . -type f -name "*.rs" -o -name "Cargo.toml" -o -name "*.md" | grep -v ".git" | sort

echo ""
echo "✅ Structure verified"
echo ""

# Step 8: Git operations
echo "🔄 Step 8: Preparing git commit..."

git add -A
git status

echo ""
echo "================================================"
echo "✅ PREPARATION COMPLETE"
echo "================================================"
echo ""
echo "📍 Repository location: $TEMP_DIR/$REPO_NAME"
echo ""
echo "📋 Next steps:"
echo "1. Review the repository: cd $TEMP_DIR/$REPO_NAME"
echo "2. Verify all files are present: ls -la"
echo "3. Commit changes:"
echo "   git commit -m 'feat: production-ready Soroban contracts with documentation'"
echo "4. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "📚 Documentation files:"
echo "   - README.md           (Architecture overview)"
echo "   - DEPLOYMENT.md       (Testnet/Mainnet deployment guide)"
echo "   - QUICKSTART.md       (5-minute setup guide)"
echo ""
echo "⚙️  CI/CD Configuration:"
echo "   - .github/workflows/contracts.yml (Automated testing and deployment)"
echo ""
echo "================================================"
