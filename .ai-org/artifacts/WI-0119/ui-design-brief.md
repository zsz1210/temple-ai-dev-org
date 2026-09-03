# UI design brief — WI-0119

- Owner: UI Designer Position
- Delivery mode: `code-first`
- Surface: Management Console, System configuration
- Goal: let a human understand whether routing is pinned, shadow, or advisory and whether Temple can execute it, without adding another dashboard or an editable control.

## Required content

Show one compact read-only configuration row with:

- selection mode;
- `Human or coordinator applies the route` when execution is not automatic;
- number of declared execution profiles;
- number of capabilities;
- number of resource-measure definitions; and
- a plain-language explanation that route resolution does not contact a Provider.

## Required states

1. Provider-neutral default with no concrete model mapping.
2. Project-owned profiles with concrete model mappings.
3. Shadow versus advisory mode.
4. Invalid policy reported by Doctor rather than rendered as a valid route.
5. Desktop wide, desktop standard, tablet, and narrow layouts without clipping or horizontal overflow.

## Interaction boundary

No button, dropdown, form, route editor, or Agent command is added. The System view remains read-only. Detailed per-step explanations belong to the CLI JSON result until a later Work Item defines a reviewed route-history experience.

## Runtime review

Run the real Console against this repository after implementation. Verify the System page at wide, standard, tablet, and narrow viewports and record exact-revision evidence. String tests alone are insufficient.
